using System.Globalization;
using System.Net;
using System.Text.RegularExpressions;
using JobTracker.Api.DTOs;

namespace JobTracker.Api.Services;

public sealed class JobDescriptionParser
{
    private static readonly Regex Company = new(@"^\s*(?:company|employer|yritys|työnantaja)\s*[:：-]\s*(?<value>[^\r\n]+?)\s*$", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    private static readonly Regex IntroCompany = new(@"^(?<value>[\p{Lu}][\p{L}\p{N}&.'-]*(?:\s+[\p{Lu}][\p{L}\p{N}&.'-]*){0,3})\s+is\s+(?:an?\s+)?(?:[\p{L}-]+\s+){0,4}(?:company|employer|organisation|organization)\b", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    private static readonly Regex HeaderCompany = new(@"^(?<value>[\p{L}\p{N}][\p{L}\p{N} &.'-]{1,80}?)\s+-\s+(?<city>Helsinki|Espoo|Vantaa|Tampere|Turku|Oulu|Jyväskylä)\s*$", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    private static readonly Regex Title = new(@"^\s*(?:job title|position|role|tehtävänimike|tehtävä)\s*[:：-]\s*(?<value>[^\r\n]+?)\s*$", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    private static readonly Regex HiringTitle = new(@"\b(?:we(?:\s+are|'re)\s+looking\s+for|we\s+are\s+hiring)\s+(?:an?\s+)?(?<value>[\p{L}][\p{L}\p{N} .+/#-]{1,80}?)\s+(?:to|who|for|with|at|in)\b", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    private static readonly Regex TitleNoun = new(@"\b(?:developer|engineer|designer|manager|analyst|specialist|architect|consultant|product owner)\b", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    private static readonly Regex Location = new(@"^\s*(?:location|sijainti|toimipaikka)\s*[:：-]\s*(?<value>[^\r\n]+?)\s*$", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    private static readonly Regex PositionLocation = new(@"\b(?:position|role|job)\s+is\s+(?:located|based)\b.{0,100}?\bin\s+(?<value>(?:[\p{L}-]+,\s*)?(?:Helsinki|Espoo|Vantaa|Tampere|Turku|Oulu|Jyväskylä))\b", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    private static readonly Regex ContextualLocation = new(@"\b(?:based in|located in|työpaikka sijaitsee|työskentelypaikka(?: on|:)?|toimisto sijaitsee)\s+(?<value>Helsinki|Espoo|Vantaa|Tampere|Turku|Oulu|Jyväskylä)\b", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    private static readonly Regex AlternativeLocation = new(@"\blocation\s+in\s+either\s+(?<value>[^.]{1,100})\.", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    private static readonly Regex Deadline = new(@"(?:application deadline|deadline|apply by|applications? close|no later than|hakuaika päättyy|hae viimeistään|viimeinen hakupäivä| päättyy)\s*[:：-]?\s*(?<date>\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[./]\d{1,2}[./]\d{4})(?!\d)", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    private static readonly Regex AnyDate = new(@"\b(?:\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[./]\d{1,2}[./]\d{4})\b", RegexOptions.CultureInvariant);
    private static readonly Regex Published = new(@"\b(?:Published|Julkaistu)\s+(?<date>\d{1,2}\.\d{1,2}\.(?:\d{4})?)", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    private static readonly Regex ListingEnds = new(@"\b(?:Ends|Päättyy|Haku\s+päättyy|Hakuaika\s+päättyy)\s+(?<date>\d{1,2}\.\d{1,2}\.(?:\d{4})?)(?:\s+(?:at|klo)\s+(?<time>\d{1,2}[:.]\d{2}\s*(?:AM|PM)?))?", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    private static readonly Regex DaysLeft = new(@"\b(?<count>\d{1,3})\s+days?\s+left\b", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);
    private static readonly (string Name, string Pattern)[] Technologies =
    [
        ("ASP.NET Core", @"(?<![\w])asp\.net\s+core(?![\w])"),
        (".NET", @"(?<![\w])(?:\.net|dotnet)(?![\w])"),
        ("TypeScript", @"\b(?:typescript|ts)\b"),
        ("JavaScript", @"\b(?:javascript|js)\b"),
        ("React", @"\breact(?:\.js)?\b"),
        ("Azure", @"\bazure\b"),
        ("SQL Server", @"\b(?:sql\s+server|mssql)\b"),
        ("PostgreSQL", @"\b(?:postgresql|postgres)\b"),
        ("Python", @"\bpython\b"),
        ("Docker", @"\bdocker\b"),
        ("Kubernetes", @"\bkubernetes\b"),
        ("AWS", @"\baws\b"),
        ("Go", @"(?-i:\bGo\b)"),
        ("NestJS", @"\bnestjs\b"),
        ("Node.js", @"\bnode(?:\.js|js)\b"),
        ("GCP", @"\b(?:gcp|google cloud(?: platform)?)\b"),
        ("Terraform", @"\bterraform\b"),
        ("GitLab", @"\bgitlab\b"),
        ("Backstage", @"\b(?:spotify\s+)?backstage\b"),
    ];

    public ParseJobDescriptionResponse Parse(string text, DateOnly? referenceDate = null)
    {
        var today = referenceDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        // Normalize copied markup only for matching and evidence; the source text is never changed.
        var normalized = Regex.Replace(WebUtility.HtmlDecode(text), @"\[(?<label>[^\]]+)\]\([^)]+\)", "${label}");
        var lines = normalized.Split('\n')
            .Select(line => line.Replace("**", "").Trim().TrimEnd('\r', '\\').Trim('*').Trim())
            .Where(line => line.Length > 0).ToArray();
        var preamble = lines.TakeWhile(line => !Published.IsMatch(line)).Take(4).ToArray();
        var headerCompany = preamble.Select(line => (line, match: HeaderCompany.Match(line)))
            .FirstOrDefault(item => item.match.Success);
        var suggestions = new List<DescriptionSuggestion>();
        var detected = new List<DescriptionDetection>();
        AddContactSuggestions(lines, suggestions);
        AddSourceSuggestion(text, lines, suggestions);
        AddSalarySuggestion(lines, suggestions);

        AddUniqueLabel(lines, Company, "companyName", suggestions);
        if (!lines.Any(line => Company.IsMatch(line)))
        {
            if (headerCompany.match is { Success: true })
                suggestions.Add(new("companyName", headerCompany.match.Groups["value"].Value, Excerpt(headerCompany.line), "high"));
            else
            {
                var intro = lines.Where(line => !line.StartsWith('#')).Take(10)
                    .Select(line => (line, match: IntroCompany.Match(line)))
                    .FirstOrDefault(item => item.match.Success);
                if (intro.match is { Success: true })
                {
                    var name = intro.match.Groups["value"].Value;
                    if (!new[] { "This", "It", "We", "There" }.Contains(name, StringComparer.OrdinalIgnoreCase))
                        suggestions.Add(new("companyName", name, Excerpt(intro.line), "medium"));
                }
            }
        }
        AddUniqueLabel(lines, Title, "jobTitle", suggestions);
        if (!lines.Any(line => Title.IsMatch(line)))
        {
            var heading = preamble.FirstOrDefault();
            var headingValue = heading?.TrimStart('#').Trim();
            if (headingValue is { Length: > 2 and <= 120 } && !headingValue.Contains('.') && TitleNoun.IsMatch(headingValue))
                suggestions.Add(new("jobTitle", headingValue, Excerpt(heading!), "high"));
            else
            {
                var titles = lines.Select(line => (line, match: HiringTitle.Match(line)))
                    .Where(item => item.match.Success)
                    .Select(item => (item.line, value: item.match.Groups["value"].Value.Trim()))
                    .Where(item => TitleNoun.IsMatch(item.value)).ToArray();
                if (titles.Length > 0 && titles.Select(item => item.value).Distinct(StringComparer.OrdinalIgnoreCase).Count() == 1)
                    suggestions.Add(new("jobTitle", titles[0].value, Excerpt(titles[0].line), "medium"));
            }
        }
        AddUniqueLabel(lines, Location, "location", suggestions);
        if (!lines.Any(line => Location.IsMatch(line)))
        {
            var contextual = lines.Select(line => (line, match: AlternativeLocation.Match(line)))
                .Where(item => item.match.Success)
                .Select(item => (item.line, value: item.match.Groups["value"].Value.Trim())).ToArray();
            if (contextual.Length == 0) contextual = lines.Select(line => (line, match: PositionLocation.Match(line)))
                .Where(item => item.match.Success)
                .Select(item => (item.line, value: item.match.Groups["value"].Value)).ToArray();
            if (contextual.Length == 0) contextual = lines.Select(line => (line, match: ContextualLocation.Match(line)))
                .Where(item => item.match.Success)
                .Select(item => (item.line, value: item.match.Groups["value"].Value)).ToArray();
            if (contextual.Length > 0 && contextual.Select(item => item.value).Distinct(StringComparer.OrdinalIgnoreCase).Count() == 1)
                suggestions.Add(new("location", contextual[0].value, Excerpt(contextual[0].line), "medium"));
            else if (contextual.Length == 0 && headerCompany.match is { Success: true })
                suggestions.Add(new("location", headerCompany.match.Groups["city"].Value, Excerpt(headerCompany.line), "high"));
        }

        var dates = lines.SelectMany(line => Deadline.Matches(line).Select(match => (line, date: match.Groups["date"].Value)))
            .Select(item => (item.line, parsed: ParseDate(item.date))).ToArray();
        var employerDeadline = dates.Length > 0 && dates.All(item => item.parsed is not null && AnyDate.Matches(item.line).Count == 1) &&
            dates.Select(item => item.parsed).Distinct().Count() == 1 ? dates[0].parsed : null;

        var publication = lines.Select(line => Published.Match(line)).FirstOrDefault(match => match.Success);
        var publishedDate = publication is null ? null : ResolvePublishedDate(publication.Groups["date"].Value, today);
        var listingEnds = lines.Select(line => (line, match: ListingEnds.Match(line)))
            .Where(item => item.match.Success)
            .Select(item => (item.line, raw: item.match.Groups["date"].Value,
                parsed: ResolveListingEnd(item.match.Groups["date"].Value, publishedDate, today))).ToArray();
        var listingDeadline = listingEnds.Length > 0 && listingEnds.All(item => item.parsed is not null) &&
            listingEnds.Select(item => item.parsed).Distinct().Count() == 1 ? listingEnds[0].parsed : null;

        if (listingDeadline is not null)
        {
            suggestions.Add(new("deadline", listingDeadline.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                Excerpt(listingEnds[0].line), YearNote(listingEnds[0].raw).Length == 0 ? "high" : "medium"));
            if (employerDeadline is not null && employerDeadline != listingDeadline)
                detected.Add(new("date", "Employer asks by " + employerDeadline.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                    Excerpt(dates[0].line)));
        }
        else if (employerDeadline is not null)
            suggestions.Add(new("deadline", employerDeadline.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                Excerpt(dates[0].line), "high"));

        foreach (var line in lines)
        {
            var published = Published.Match(line);
            if (published.Success)
                detected.Add(new("date", "Published " + published.Groups["date"].Value + YearNote(published.Groups["date"].Value), Excerpt(line)));
            var listingEnd = ListingEnds.Match(line);
            if (listingEnd.Success)
            {
                var value = "Listing ends " + listingEnd.Groups["date"].Value;
                if (listingEnd.Groups["time"].Success) value += " at " + listingEnd.Groups["time"].Value.Trim();
                detected.Add(new("date", value + YearNote(listingEnd.Groups["date"].Value), Excerpt(line)));
            }
            var daysLeft = DaysLeft.Match(line);
            if (daysLeft.Success)
                detected.Add(new("date", daysLeft.Value + " (reference date unknown)", Excerpt(line)));
        }

        foreach (var (name, pattern) in Technologies)
        {
            var evidence = lines.FirstOrDefault(line => Regex.IsMatch(line, pattern, RegexOptions.IgnoreCase | RegexOptions.CultureInvariant));
            if (evidence is not null) detected.Add(new("technology", name, Excerpt(evidence)));
        }

        var arrangement = new[]
        {
            ("Remote", @"\b(?:remote|etätyö|etänä)\b"),
            ("Hybrid", @"\b(?:hybrid|hybridi|hybridityö)\b"),
            ("On-site", @"\b(?:on-site|onsite|lähityö|paikan päällä)\b"),
        };
        foreach (var (name, pattern) in arrangement)
        {
            var evidence = lines.FirstOrDefault(line => Regex.IsMatch(line, pattern, RegexOptions.IgnoreCase | RegexOptions.CultureInvariant));
            if (evidence is not null) detected.Add(new("workArrangement", name, Excerpt(evidence)));
        }

        return new(suggestions, detected);
    }

    private static void AddUniqueLabel(string[] lines, Regex pattern, string field, List<DescriptionSuggestion> suggestions)
    {
        var matches = lines.Select(line => (line, match: pattern.Match(line)))
            .Where(item => item.match.Success)
            .Select(item => (item.line, value: item.match.Groups["value"].Value.Trim().TrimEnd('.', ',')))
            .Where(item => item.value.Length is > 0 and <= 200).ToArray();
        if (matches.Length == 0 || matches.Select(item => item.value).Distinct(StringComparer.OrdinalIgnoreCase).Count() != 1) return;
        suggestions.Add(new(field, matches[0].value, Excerpt(matches[0].line), "high"));
    }

    private static void AddContactSuggestions(string[] lines, List<DescriptionSuggestion> suggestions)
    {
        var contactLines = lines.Where(line => Regex.IsMatch(line,
            @"\b(contact|inquiries|enquiries|lisätieto\w*|yhtey\w*)\b", RegexOptions.IgnoreCase))
            .Where(line => !Regex.IsMatch(line, @"privacy|data protection|tietosuoja|\bdpo\b", RegexOptions.IgnoreCase)).ToArray();
        var emails = contactLines.SelectMany(line => Regex.Matches(line,
                @"(?<![\w.+-])[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
            .Select(match => (line, value: match.Value)))
            .Where(item => !Regex.IsMatch(item.value, @"^(privacy|dpo|noreply|no-reply|tietosuoja)@", RegexOptions.IgnoreCase)).ToArray();
        AddUniqueCandidate(emails, "contactEmail", "high", suggestions);

        // Keep names tied to an explicit contact cue; optional titles are a small supported vocabulary.
        var namePattern = @"\b(?i:contact(?: person)?|yhteyshenkilö|lisätietoja(?: antaa)?)\s*[:：]?\s*" +
            @"(?:(?:Development Team Manager|Hiring Manager|Recruitment Manager|HR Manager)\s+)?" +
            @"(?<name>[\p{Lu}][\p{L}'’-]+(?:\s+[\p{Lu}][\p{L}'’-]+){1,3})(?=\s*(?:[,:(]|$|\bby email\b|\bat\b))";
        var names = contactLines.SelectMany(line => Regex.Matches(line, namePattern)
            .Select(match => (line, value: match.Groups["name"].Value))).ToArray();
        AddUniqueCandidate(names, "contactPerson", "medium", suggestions);
    }

    private static void AddSourceSuggestion(string original, string[] lines, List<DescriptionSuggestion> suggestions)
    {
        var label = new Regex(@"^\s*(?:source|lähde)\s*[:：]\s*(?<value>[^\r\n]+)$", RegexOptions.IgnoreCase);
        AddUniqueLabel(lines, label, "source", suggestions);
        if (lines.Any(line => label.IsMatch(line))) return;

        // Use the copied listing header, before body links such as benefits or diversity policies.
        var header = original.Split('\n').TakeWhile(line => !Regex.IsMatch(line, @"^\s*(?:#+\s*)?(?:Published|Julkaistu|Job description|Työpaikkakuvaus)\b", RegexOptions.IgnoreCase)).Take(8);
        var links = header.SelectMany(line => Regex.Matches(line, @"\[[^\]]+\]\((?<url>https?://[^\s)]+)\)")
            .Select(match => (line, url: match.Groups["url"].Value))).ToArray();
        var boardLinks = links.Where(item => Uri.TryCreate(item.url, UriKind.Absolute, out var uri) &&
            (uri.Host.Equals("duunitori.fi", StringComparison.OrdinalIgnoreCase) || uri.Host.Equals("www.duunitori.fi", StringComparison.OrdinalIgnoreCase))).ToArray();
        if (boardLinks.Select(item => item.url).Distinct().Count() >= 2 && boardLinks.Length == links.Length)
            suggestions.Add(new("source", "Duunitori", Excerpt(boardLinks[0].line), "medium"));
    }

    private static void AddSalarySuggestion(string[] lines, List<DescriptionSuggestion> suggestions)
    {
        const string amount = @"\d{1,3}(?:[ ,.]\d{3})+(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?";
        var pattern = @"(?<value>(?:(?:EUR|USD|GBP|€|\$|£)\s*(?:" + amount + @")(?:\s*[-–—]\s*(?:EUR|USD|GBP|€|\$|£)?\s*(?:" + amount + @"))?|(?:" + amount + @")\s*(?:[-–—]\s*(?:" + amount + @"))?\s*(?:EUR|USD|GBP|€|\$|£))(?:(?:\s*/\s*|\s+per\s+)(?:month|year|hour|kk|vuosi|vuodessa|h)|\s+(?:monthly|annually))?)";
        var matches = lines.Where(line => Regex.IsMatch(line, @"\b(?:salary|pay|palkka|palkkahaarukka|palkkaus)\b", RegexOptions.IgnoreCase))
            .Where(line => !Regex.IsMatch(line, @"revenue|turnover|liikevaihto|salary (?:request|expectation)|palkkatoive", RegexOptions.IgnoreCase))
            .SelectMany(line => Regex.Matches(line, pattern, RegexOptions.IgnoreCase).Select(match => (line, value: match.Groups["value"].Value.Trim()))).ToArray();
        AddUniqueCandidate(matches, "salaryRange", "high", suggestions);
    }

    private static void AddUniqueCandidate((string line, string value)[] candidates, string field, string confidence, List<DescriptionSuggestion> suggestions)
    {
        if (candidates.Length == 0 || candidates.Select(item => item.value).Distinct(StringComparer.OrdinalIgnoreCase).Count() != 1) return;
        suggestions.Add(new(field, candidates[0].value, Excerpt(candidates[0].line), confidence));
    }

    private static DateOnly? ParseDate(string value)
    {
        var formats = new[] { "yyyy-M-d", "d.M.yyyy", "d/M/yyyy" };
        return DateOnly.TryParseExact(value, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var date)
            ? date : null;
    }

    private static DateOnly? ResolvePublishedDate(string value, DateOnly today)
    {
        if (YearNote(value).Length == 0) return ParseDate(value);
        var candidate = ParsePartialDate(value, today.Year);
        if (candidate is null) return null;
        if (candidate > today) candidate = ParsePartialDate(value, today.Year - 1);
        return candidate;
    }

    private static DateOnly? ResolveListingEnd(string value, DateOnly? published, DateOnly today)
    {
        if (YearNote(value).Length == 0) return ParseDate(value);
        var anchor = published ?? today;
        var candidate = ParsePartialDate(value, anchor.Year);
        if (candidate is null) return null;
        if (candidate < anchor) candidate = ParsePartialDate(value, anchor.Year + 1);
        return candidate;
    }

    private static DateOnly? ParsePartialDate(string value, int year)
    {
        if (year is < 1 or > 9999) return null;
        return DateOnly.TryParseExact(value + year, "d.M.yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date)
            ? date : null;
    }

    private static string Excerpt(string line) => line.Length <= 180 ? line : line[..180] + "…";

    private static string YearNote(string date) => Regex.IsMatch(date, @"\d{4}$") ? "" : " (year not stated)";
}
