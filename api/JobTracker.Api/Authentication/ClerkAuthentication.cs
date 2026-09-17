using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace JobTracker.Api.Authentication;

public sealed class ClerkOptions
{
    public string Authority { get; set; } = "";
    public string? Audience { get; set; }
    public string[] AuthorizedParties { get; set; } = [];
}

public static class ClerkAuthentication
{
    public static IServiceCollection AddClerkAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<ClerkOptions>().Bind(configuration.GetSection("Clerk"))
            .Validate(options => Uri.TryCreate(options.Authority, UriKind.Absolute, out var uri)
                && uri.Scheme == "https" && string.IsNullOrEmpty(uri.Query) && string.IsNullOrEmpty(uri.Fragment),
                "Clerk:Authority must be your Clerk instance's HTTPS Frontend API URL.")
            .Validate(options => options.AuthorizedParties.Length > 0
                && options.AuthorizedParties.All(origin => Uri.TryCreate(origin, UriKind.Absolute, out var uri)
                    && (uri.Scheme == "https" || uri.Scheme == "http")
                    && uri.GetLeftPart(UriPartial.Authority) == origin),
                "Clerk:AuthorizedParties must contain the exact permitted frontend origins.")
            .ValidateOnStart();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IOptions<ClerkOptions>>((options, clerkOptions) =>
            {
                var clerk = clerkOptions.Value;
                options.Authority = clerk.Authority.TrimEnd('/');
                options.MapInboundClaims = false;
                options.IncludeErrorDetails = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = options.Authority,
                    ValidateIssuerSigningKey = true,
                    RequireSignedTokens = true,
                    ValidAlgorithms = [SecurityAlgorithms.RsaSha256],
                    ValidateLifetime = true,
                    RequireExpirationTime = true,
                    ClockSkew = TimeSpan.FromSeconds(5),
                    // Default Clerk session tokens have no aud. Only validate a configured audience.
                    ValidateAudience = !string.IsNullOrWhiteSpace(clerk.Audience),
                    ValidAudience = clerk.Audience
                };
                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = context =>
                    {
                        var subject = context.Principal?.FindFirst("sub")?.Value;
                        var party = context.Principal?.FindFirst("azp")?.Value;
                        if (string.IsNullOrWhiteSpace(subject)
                            || (party is not null && !clerk.AuthorizedParties.Contains(party, StringComparer.Ordinal))
                            || context.Principal?.FindFirst("sts")?.Value == "pending")
                            context.Fail("Invalid session.");
                        return Task.CompletedTask;
                    }
                };
            });
        services.AddAuthorization();
        return services;
    }
}
