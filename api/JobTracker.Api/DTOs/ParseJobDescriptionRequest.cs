using System.ComponentModel.DataAnnotations;

namespace JobTracker.Api.DTOs;

public sealed class ParseJobDescriptionRequest
{
    [Required, MaxLength(20000)]
    public string Text { get; init; } = string.Empty;

    public DateOnly? ReferenceDate { get; init; }
}

public sealed record DescriptionSuggestion(string Field, string Value, string Evidence, string Confidence);

public sealed record DescriptionDetection(string Category, string Value, string Evidence);

public sealed record ParseJobDescriptionResponse(
    IReadOnlyList<DescriptionSuggestion> Suggestions,
    IReadOnlyList<DescriptionDetection> Detected);
