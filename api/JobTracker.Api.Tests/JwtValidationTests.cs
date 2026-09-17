using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace JobTracker.Api.Tests;

public sealed class JwtValidationTests
{
    [Theory]
    [InlineData("valid", 200)]
    [InlineData("no-azp", 200)]
    [InlineData("wrong-signature", 401)]
    [InlineData("wrong-issuer", 401)]
    [InlineData("expired", 401)]
    [InlineData("future", 401)]
    [InlineData("wrong-party", 401)]
    [InlineData("no-subject", 401)]
    [InlineData("pending", 401)]
    [InlineData("wrong-algorithm", 401)]
    [InlineData("audience-match", 200)]
    [InlineData("audience-mismatch", 401)]
    public async Task Real_bearer_validation_uses_local_keys_and_never_calls_Clerk(string scenario, int expected)
    {
        using var rsa = RSA.Create(2048);
        using var otherRsa = RSA.Create(2048);
        var key = new RsaSecurityKey(rsa) { KeyId = "test-key" };
        var publicKey = new RsaSecurityKey(rsa.ExportParameters(false)) { KeyId = key.KeyId };
        const string issuer = "https://clerk.test.invalid";
        var metadata = new OpenIdConnectConfiguration { Issuer = issuer };
        metadata.SigningKeys.Add(publicKey);
        using var factory = new ApplicationsApiFactory();
        using var initialized = factory.CreateInitializedClient();
        using var jwtFactory = factory.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            });
            services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.ConfigurationManager = new StaticConfigurationManager<OpenIdConnectConfiguration>(metadata);
                if (scenario.StartsWith("audience-", StringComparison.Ordinal))
                {
                    options.TokenValidationParameters.ValidateAudience = true;
                    options.TokenValidationParameters.ValidAudience = "configured-test-audience";
                }
            });
        }));
        using var client = jwtFactory.CreateClient();
        var claims = new List<Claim>();
        if (scenario != "no-subject") claims.Add(new Claim("sub", "user-a"));
        if (scenario != "no-azp") claims.Add(new Claim("azp", scenario == "wrong-party" ? "https://untrusted.invalid" : "http://localhost:5173"));
        if (scenario == "pending") claims.Add(new Claim("sts", "pending"));
        var now = DateTime.UtcNow;
        var token = new JwtSecurityToken(
            issuer: scenario == "wrong-issuer" ? "https://other.invalid" : issuer,
            audience: scenario == "audience-match" ? "configured-test-audience" : null,
            claims: claims,
            notBefore: scenario == "future" ? now.AddMinutes(2) : now.AddMinutes(-5),
            expires: scenario == "expired" ? now.AddMinutes(-1) : now.AddMinutes(5),
            signingCredentials: new SigningCredentials(scenario == "wrong-signature" ? new RsaSecurityKey(otherRsa) { KeyId = key.KeyId } : key,
                scenario == "wrong-algorithm" ? SecurityAlgorithms.RsaSha512 : SecurityAlgorithms.RsaSha256));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", new JwtSecurityTokenHandler().WriteToken(token));
        Assert.Equal((HttpStatusCode)expected, (await client.GetAsync("/api/applications")).StatusCode);
    }
}
