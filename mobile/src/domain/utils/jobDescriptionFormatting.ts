// Keep wording, bullet markers and indentation; only normalize line endings and
// trailing whitespace, and keep at most one blank line between paragraphs.
export function cleanJobDescriptionFormatting(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(line => line.replace(/[\t ]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+|\n+$/g, "");
}
