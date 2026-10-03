import { expect, it } from "vitest";
import { cleanJobDescriptionFormatting } from "./jobDescriptionFormatting";

it("normalizes line endings and blank lines while preserving text, bullets and indentation", () => {
  const input = "\r\nRole  title  \r\n\r\n \r\nResponsibilities\r\n- Build interfaces  \r\n  - Keep nested bullets\t\rRequirements\r\n1. TypeScript\r\n• Collaboration\r\n\r\n";
  expect(cleanJobDescriptionFormatting(input)).toBe("Role  title\n\nResponsibilities\n- Build interfaces\n  - Keep nested bullets\nRequirements\n1. TypeScript\n• Collaboration");
});

it.each(["", " \t\r\n  ", "Role\n\n- One\n  - Two", "  Indented first line\n\nParagraph."])(
  "is safe and idempotent for %j", input => {
    const result = cleanJobDescriptionFormatting(input);
    expect(cleanJobDescriptionFormatting(result)).toBe(result);
    expect(result.replace(/\s/g, "")).toBe(input.replace(/\s/g, ""));
  },
);

it("preserves long pasted advertisements without truncation", () => {
  const input = "Requirements\n  - Build reliable software.  \n\n".repeat(1000);
  const result = cleanJobDescriptionFormatting(input);
  expect(result.replace(/\s/g, "")).toBe(input.replace(/\s/g, ""));
  expect(result.match(/Build reliable software/g)).toHaveLength(1000);
});
