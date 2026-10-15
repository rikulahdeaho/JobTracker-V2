using System.Net;
using System.Net.Http.Json;
using JobTracker.Api.DTOs;
using JobTracker.Api.Services;
using Xunit;

namespace JobTracker.Api.Tests;

public sealed class JobDescriptionParserTests
{
    private readonly JobDescriptionParser parser = new();

    [Fact]
    public void ParsesExplicitFinnishFactsAndDeduplicatesTechnologies()
    {
        var result = parser.Parse("Yritys: Esimerkki Oy\nTehtävänimike: Kehittäjä\nSijainti: Helsinki\nHakuaika päättyy 31.10.2026\nReact ja react.js, ASP.NET Core sekä dotnet. Hybridityö.");
        Assert.Contains(result.Suggestions, item => item.Field == "companyName" && item.Value == "Esimerkki Oy");
        Assert.Contains(result.Suggestions, item => item.Field == "jobTitle" && item.Value == "Kehittäjä");
        Assert.Contains(result.Suggestions, item => item.Field == "location" && item.Value == "Helsinki");
        Assert.Contains(result.Suggestions, item => item.Field == "deadline" && item.Value == "2026-10-31");
        Assert.Single(result.Detected, item => item.Value == "React");
        Assert.Contains(result.Detected, item => item.Value == "ASP.NET Core" && item.Evidence.Contains("ASP.NET Core"));
        Assert.Contains(result.Detected, item => item.Value == "Hybrid");
    }

    [Fact]
    public void ParsesExplicitEnglishFacts()
    {
        var result = parser.Parse("Company: Example Ltd\nJob title: Software Engineer\nLocation: Espoo\nApply by 2026-11-05\nTypeScript, SQL Server and Azure. Remote work.");
        Assert.Equal(4, result.Suggestions.Count);
        Assert.Contains(result.Suggestions, item => item.Field == "deadline" && item.Value == "2026-11-05");
        Assert.Contains(result.Detected, item => item.Value == "TypeScript");
        Assert.Contains(result.Detected, item => item.Value == "SQL Server");
        Assert.Contains(result.Detected, item => item.Value == "Azure");
        Assert.Contains(result.Detected, item => item.Value == "Remote");
    }

    [Fact]
    public void ParsesNarrativeVeikkausAdvertisementWithoutUsingSkillsAsFormFields()
    {
        const string description = """
            ## Job description

            *Veikkaus is a gaming company for everyone, striving to be better in every aspect. Responsibility is a core of our operations.*\

            We're looking for a **Lead Developer** to lead the product development from technology point of view of our DevOps Platforms.\
            As a Lead Developer you will help define and maintain the roadmap from a technical point of vie&#x77;**.&#x20;**

            The position is located at Veikkaus' headquarters in Pohjois-Haaga, Helsinki. We meet at the office three times a week. This is a permanent, full-time position starting in November 2026.

            - Web development (e.g., Typescript, React, Go, NestJS, Node.js)
            - Cloud infra (preferably GCP) and Kubernetes
            - Terraform, Gitlab pipelines
            - Spotify Backstage

            Please send your application with CV and salary request no later than **25.10.2026.**
            For inquiries contact Development Team Manager Mikko Kivipelto at mikko.kivipelto@veikkaus.fi.
            """;

        var result = parser.Parse(description);

        Assert.Equal(6, result.Suggestions.Count);
        Assert.Contains(result.Suggestions, item => item.Field == "companyName" && item.Value == "Veikkaus" && item.Confidence == "medium");
        Assert.Contains(result.Suggestions, item => item.Field == "jobTitle" && item.Value == "Lead Developer" && item.Confidence == "medium");
        Assert.Contains(result.Suggestions, item => item.Field == "location" && item.Value == "Pohjois-Haaga, Helsinki");
        Assert.Contains(result.Suggestions, item => item.Field == "deadline" && item.Value == "2026-10-25");
        Assert.All(result.Suggestions, item => Assert.NotEmpty(item.Evidence));
        foreach (var technology in new[] { "TypeScript", "React", "Go", "NestJS", "Node.js", "GCP", "Kubernetes", "Terraform", "GitLab", "Backstage" })
            Assert.Contains(result.Detected, item => item.Value == technology);
        Assert.Contains(result.Suggestions, item => item.Field == "contactPerson" && item.Value == "Mikko Kivipelto");
        Assert.Contains(result.Suggestions, item => item.Field == "contactEmail" && item.Value == "mikko.kivipelto@veikkaus.fi");
        Assert.DoesNotContain(result.Suggestions, item => item.Field is "status" or "salaryRange");
    }

    [Fact]
    public void ParsesAuroraListingHeaderButDoesNotInventDeadlineFromRelativeDaysLeft()
    {
        const string description = """
            # AI Driven Full Stack Developer

            [Aurora Live ](https://duunitori.fi/tyopaikat/yritys/aurora-live)[- Helsinki](https://duunitori.fi/tyopaikat/alue/helsinki)
            Published 7.10. (3 days left)

            ## Job description
            Aurora Live is a fast-growing European company with operations in 10+ markets.
            As we grow, we are looking for an AI-Driven Full Stack Developer to join our Helsinki team.
            - Proficiency with TypeScript/JavaScript, React, Angular or Vue
            - Hands-on expertise with Node.js, MySQL and MariaDB
            """;

        var result = parser.Parse(description);

        Assert.Contains(result.Suggestions, item => item.Field == "companyName" && item.Value == "Aurora Live");
        Assert.Contains(result.Suggestions, item => item.Field == "jobTitle" && item.Value == "AI Driven Full Stack Developer");
        Assert.Contains(result.Suggestions, item => item.Field == "location" && item.Value == "Helsinki");
        Assert.DoesNotContain(result.Suggestions, item => item.Field == "deadline");
        Assert.Contains(result.Detected, item => item.Category == "date" && item.Value == "Published 7.10. (year not stated)");
        Assert.Contains(result.Detected, item => item.Category == "date" && item.Value == "3 days left (reference date unknown)");
    }

    [Fact]
    public void UsesListingEndForNordeaAndRetainsEarlierEmployerDateForReview()
    {
        const string description = """
            Fullstack Developer - AI and API Platform Portal
            Nordea Bank Abp - Helsinki

            Published 14.10. (Ends 24.10. at 12:59 AM)

            Job description
            We are looking for a Fullstack Developer to join our team.
            This is a full-time permanent position with a hybrid working location in either Helsinki, Finland, or Gdańsk, Poland.
            Submit your application no later than 23/10/2026.
            In accordance with Regulation (EU) 2016/679 and an act dated 27 April 2016.
            """;

        var result = parser.Parse(description, new DateOnly(2026, 10, 15));

        Assert.Contains(result.Suggestions, item => item.Field == "companyName" && item.Value == "Nordea Bank Abp");
        Assert.Contains(result.Suggestions, item => item.Field == "jobTitle" && item.Value == "Fullstack Developer - AI and API Platform Portal");
        Assert.Contains(result.Suggestions, item => item.Field == "location" && item.Value == "Helsinki, Finland, or Gdańsk, Poland");
        Assert.Contains(result.Suggestions, item => item.Field == "deadline" && item.Value == "2026-10-24" && item.Confidence == "medium");
        Assert.Contains(result.Detected, item => item.Category == "date" && item.Value == "Published 14.10. (year not stated)");
        Assert.Contains(result.Detected, item => item.Category == "date" && item.Value == "Listing ends 24.10. at 12:59 AM (year not stated)");
        Assert.Contains(result.Detected, item => item.Category == "date" && item.Value == "Employer asks by 2026-10-23");
    }

    [Fact]
    public void InfersNextYearForAcademicWorkListingEndAfterAutumnPublication()
    {
        const string description = """
            # Junior Drupal Developer
            [Academic Work ](https://duunitori.fi/yritys/academic-work)[- Helsinki](https://duunitori.fi/tyopaikat/alue/helsinki)
            Published 12.10. (Ends 12.4.)
            ## Job description
            Our client is looking for a Junior Drupal Developer to join their team.
            Our selection process is continuous and the advert may close before the recruitment process is completed.
            """;

        var result = parser.Parse(description, new DateOnly(2026, 10, 15));

        Assert.Contains(result.Suggestions, item => item.Field == "companyName" && item.Value == "Academic Work");
        Assert.Contains(result.Suggestions, item => item.Field == "jobTitle" && item.Value == "Junior Drupal Developer");
        Assert.Contains(result.Suggestions, item => item.Field == "location" && item.Value == "Helsinki");
        Assert.Contains(result.Suggestions, item => item.Field == "deadline" && item.Value == "2027-04-12" && item.Confidence == "medium");
        Assert.Contains(result.Detected, item => item.Category == "date" && item.Value == "Listing ends 12.4. (year not stated)");
    }

    [Fact]
    public void UsesFullYearListingEndWithoutInference()
    {
        var result = parser.Parse("Published 12.10.2026 (Ends 12.4.2027)", new DateOnly(2026, 10, 15));
        Assert.Contains(result.Suggestions, item => item.Field == "deadline" && item.Value == "2027-04-12" && item.Confidence == "high");
    }

    [Fact]
    public void ResolvesFinnishPublicationAndYearlessListingEndAcrossYearBoundary()
    {
        var result = parser.Parse("# Junior Developer\n[Academic Work](https://duunitori.fi/yritys/academic-work) [- Helsinki](https://duunitori.fi/tyopaikat/alue/helsinki)\nJulkaistu 12.10. (Päättyy 12.4.)", new DateOnly(2026, 10, 15));

        Assert.Contains(result.Suggestions, item => item.Field == "deadline" && item.Value == "2027-04-12" && item.Confidence == "medium");
        Assert.Contains(result.Suggestions, item => item.Field == "source" && item.Value == "Duunitori");
        Assert.Contains(result.Detected, item => item.Category == "date" && item.Value == "Published 12.10. (year not stated)");
        Assert.Contains(result.Detected, item => item.Category == "date" && item.Value == "Listing ends 12.4. (year not stated)");
    }

    [Theory]
    [InlineData("Julkaistu 12.10.2026 (Päättyy 24.10.2026 klo 16.00)", "2026-10-24", "high")]
    [InlineData("Julkaistu 12.10. (Haku päättyy 24.10. klo 16:00)", "2026-10-24", "medium")]
    [InlineData("Hakuaika päättyy 24.10.2026", "2026-10-24", "high")]
    public void RecognizesFinnishListingEndLabels(string description, string expected, string confidence)
    {
        var result = parser.Parse(description, new DateOnly(2026, 10, 15));
        Assert.Contains(result.Suggestions, item => item.Field == "deadline" && item.Value == expected && item.Confidence == confidence);
    }

    [Fact]
    public void DoesNotTurnClientMentionsOrUnclearHiringCopyIntoCompanyOrTitle()
    {
        var result = parser.Parse("Our client Veikkaus has offices in Helsinki. We are looking for someone to join a growing team.");
        Assert.DoesNotContain(result.Suggestions, item => item.Field is "companyName" or "jobTitle");
    }

    [Fact]
    public void RecognizesContextualLocationWithoutGuessingFromUnrelatedPlaceNames()
    {
        var result = parser.Parse("The position is based in Helsinki. Our clients include a company in Turku.");
        Assert.Contains(result.Suggestions, item => item.Field == "location" && item.Value == "Helsinki" && item.Confidence == "medium");
        Assert.DoesNotContain(result.Suggestions, item => item.Value == "Turku");
    }

    [Fact]
    public void OmitsAmbiguousOrUnsupportedFacts()
    {
        var result = parser.Parse("Company: Alpha Oy\nCompany: Beta Oy\nReact and Azure wanted.\nApply by 31.02.2026\nApply by 1.3.2026\nWe also mention 2026-12-01 elsewhere.");
        Assert.DoesNotContain(result.Suggestions, item => item.Field is "companyName" or "jobTitle" or "deadline");
        Assert.NotEmpty(result.Detected);
    }

    [Fact]
    public void OmitsMultipleDatesOnOneDeadlineLine()
    {
        var result = parser.Parse("Apply by 2026-11-05 or 2026-11-06");
        Assert.DoesNotContain(result.Suggestions, item => item.Field == "deadline");
    }

    [Fact]
    public void ReturnsEmptyForUnlabeledCopy()
    {
        var result = parser.Parse("Join our growing team for exciting opportunities.");
        Assert.Empty(result.Suggestions);
        Assert.Empty(result.Detected);
    }

    [Fact]
    public void ExtractsVeikkausContactFromMarkdownWithoutUsingPrivacyAddress()
    {
        var result = parser.Parse("For any inquiries contact Development Team Manager Mikko Kivipelto by email: [mikko.kivipelto@veikkaus.fi](mailto:mikko.kivipelto@veikkaus.fi)\nFor privacy inquiries contact privacy@veikkaus.fi.");
        Assert.Contains(result.Suggestions, item => item.Field == "contactEmail" && item.Value == "mikko.kivipelto@veikkaus.fi");
        Assert.Contains(result.Suggestions, item => item.Field == "contactPerson" && item.Value == "Mikko Kivipelto");
    }

    [Theory]
    [InlineData("Contact person: Jane Smith", "Jane Smith")]
    [InlineData("Lisätietoja antaa Maija Meikäläinen, maija@example.fi", "Maija Meikäläinen")]
    public void ExtractsExplicitContactNames(string text, string expected)
    {
        Assert.Contains(parser.Parse(text).Suggestions, item => item.Field == "contactPerson" && item.Value == expected);
    }

    [Theory]
    [InlineData("Salary: 4 000–5 500 €/kk", "4 000–5 500 €/kk")]
    [InlineData("Salary: €60,000–75,000 per year", "€60,000–75,000 per year")]
    [InlineData("Palkka: 4000-5500 EUR/kk", "4000-5500 EUR/kk")]
    [InlineData("Salary: EUR 5000 per month", "EUR 5000 per month")]
    public void PreservesSalaryCurrencyAndPeriod(string text, string expected)
    {
        Assert.Contains(parser.Parse(text).Suggestions, item => item.Field == "salaryRange" && item.Value == expected);
    }

    [Fact]
    public void InfersSourceFromListingHeaderButNotUnrelatedLinks()
    {
        var header = "# Developer\n[Aurora Live](https://duunitori.fi/tyopaikat/yritys/aurora-live) [- Helsinki](https://duunitori.fi/tyopaikat/alue/helsinki)\nPublished 7.10.";
        Assert.Contains(parser.Parse(header).Suggestions, item => item.Field == "source" && item.Value == "Duunitori");
        Assert.DoesNotContain(parser.Parse("# Job description\n[Benefits](https://duunitori.fi/benefits) [Diversity](https://duunitori.fi/diversity)").Suggestions, item => item.Field == "source");
        Assert.DoesNotContain(parser.Parse(header.Replace("duunitori.fi/", "duunitori.fi.evil.test/")).Suggestions, item => item.Field == "source");
        Assert.Contains(parser.Parse("Source: LinkedIn").Suggestions, item => item.Field == "source" && item.Value == "LinkedIn");
    }

    [Theory]
    [InlineData("Annual revenue of €40M. Please send your salary request.")]
    [InlineData("Salary request: €5000 per month")]
    [InlineData("For data protection contact privacy@example.com.")]
    [InlineData("Our colleague Jane Smith works here. jane@example.com")]
    [InlineData("Contact Jane Smith: jane@example.com\nContact John Smith: john@example.com\nSalary: €4000/month\nSalary: €6000/month")]
    public void OmitsUnrelatedAndConflictingAdditionalFacts(string text)
    {
        Assert.DoesNotContain(parser.Parse(text).Suggestions, item => item.Field is "contactPerson" or "contactEmail" or "salaryRange");
    }
}

public sealed class JobDescriptionEndpointTests : IDisposable
{
    private readonly ApplicationsApiFactory factory = new();

    [Fact]
    public async Task RequiresAuthentication()
    {
        using var client = factory.CreateInitializedClient(userId: null);
        var response = await client.PostAsJsonAsync("/api/job-description/parse", new { text = "Company: Example" });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task RejectsBlankText(string text)
    {
        using var client = factory.CreateInitializedClient();
        var response = await client.PostAsJsonAsync("/api/job-description/parse", new { text });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task RejectsOverlongText()
    {
        using var client = factory.CreateInitializedClient();
        var response = await client.PostAsJsonAsync("/api/job-description/parse", new { text = new string('a', 20001) });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ReturnsSuggestionsWithoutCreatingAnApplication()
    {
        using var client = factory.CreateInitializedClient();
        var response = await client.PostAsJsonAsync("/api/job-description/parse", new { text = "Company: Example Oy\nJob title: Developer\nContact person: Jane Smith\nContact email: jane@example.com\nSource: Duunitori\nSalary: 4000–5500 €/kk" });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ParseJobDescriptionResponse>();
        Assert.Contains(result!.Suggestions, item => item.Field == "companyName" && item.Evidence == "Company: Example Oy");
        foreach (var field in new[] { "contactPerson", "contactEmail", "source", "salaryRange" })
            Assert.Contains(result.Suggestions, item => item.Field == field && !string.IsNullOrWhiteSpace(item.Evidence));
        Assert.Empty((await client.GetFromJsonAsync<object[]>("/api/applications"))!);
    }

    [Fact]
    public async Task ResolvesYearlessListingEndUsingRequestReferenceDate()
    {
        using var client = factory.CreateInitializedClient();
        var response = await client.PostAsJsonAsync("/api/job-description/parse", new
        {
            text = "Published 12.10. (Ends 12.4.)",
            referenceDate = "2026-10-15"
        });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<ParseJobDescriptionResponse>();
        Assert.Contains(result!.Suggestions, item => item.Field == "deadline" && item.Value == "2027-04-12");
    }

    public void Dispose() => factory.Dispose();
}
