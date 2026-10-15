import { expect, it } from "vitest";
import { cleanJobDescriptionFormatting } from "./jobDescriptionFormatting";
import { restorePastedListMarkers } from "./jobDescriptionPaste";

const html = `<strong>Considered as an advantage:</strong><ul>
  <li>Have at least 4 years of working experience in software development</li>
  <li>A passion for quality and maintainability</li>
  <li>Good collaboration skills: you ask for help from others when needed and help others by sharing your expertise</li>
  <li>Experience with UI development technologies</li>
  <li>Proficiency in Finnish, both spoken and written</li>
</ul>`;

const plain = `Considered as an advantage:\n\nHave at least 4 years of working experience in software development\nA passion for quality and maintainability\nGood collaboration skills: you ask for help from others when needed and help others by sharing your expertise\nExperience with UI development technologies\nProficiency in Finnish, both spoken and written`;

it("restores list markers lost when pasting a web page into a textarea", () => {
  const restored = restorePastedListMarkers(plain, html);
  expect(restored).toBe(`Considered as an advantage:\n\n- Have at least 4 years of working experience in software development\n- A passion for quality and maintainability\n- Good collaboration skills: you ask for help from others when needed and help others by sharing your expertise\n- Experience with UI development technologies\n- Proficiency in Finnish, both spoken and written`);
  expect(cleanJobDescriptionFormatting(restored)).toBe(restored);
});

it("keeps existing markers and plain-only pastes unchanged", () => {
  expect(restorePastedListMarkers("• First\n- Second", "<ul><li>First</li><li>Second</li></ul>")).toBe("• First\n- Second");
  expect(restorePastedListMarkers(plain, "")).toBe(plain);
  expect(restorePastedListMarkers(plain, "<p>Considered as an advantage:</p>")).toBe(plain);
});

it("retains ordered numbering and indented nested bullets", () => {
  const input = "First\n  Child\nSecond";
  const copiedHtml = "<ol start='3'><li>First<ul><li>Child</li></ul></li><li>Second</li></ol>";
  expect(restorePastedListMarkers(input, copiedHtml)).toBe("3. First\n  - Child\n4. Second");
});
