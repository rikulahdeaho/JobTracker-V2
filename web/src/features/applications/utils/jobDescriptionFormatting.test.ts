import { expect, it } from "vitest";
import { cleanJobDescriptionFormatting } from "./jobDescriptionFormatting";

it("normalizes line endings, section spacing and bullet markers while preserving indentation", () => {
  const input = "\r\nRole  title  \r\n\r\n \r\nResponsibilities\r\n- Build interfaces  \r\n  - Keep nested bullets\t\rRequirements\r\n1. TypeScript\r\n• Collaboration\r\n\r\n";
  expect(cleanJobDescriptionFormatting(input)).toBe("Role  title\n\nResponsibilities\n\n- Build interfaces\n  - Keep nested bullets\n\nRequirements\n\n1. TypeScript\n- Collaboration");
});

it.each(["", " \t\r\n  ", "Role\n\n- One\n  - Two", "  Indented first line\n\nParagraph.", "**Roolisi meillä**\n* Tee työtä", "Odotamme sinulta\nosaamista\nkokemusta"])(
  "is safe and idempotent for %j", input => {
    const result = cleanJobDescriptionFormatting(input);
    expect(cleanJobDescriptionFormatting(result)).toBe(result);
  },
);

it("preserves long pasted advertisements without truncation", () => {
  const input = "Requirements\n  - Build reliable software.  \n\n".repeat(1000);
  const result = cleanJobDescriptionFormatting(input);
  expect(result.match(/Build reliable software/g)).toHaveLength(1000);
});

it("cleans pasted K-Ruoka role text and leaves technical hyphens intact", () => {
  const input = "\\\n**Roolisi meillä**\n\n- Työsi vaikuttaa palveluihin.\n* Suunnittelet **Node.js**- ja **TypeScript**-pohjaisia API-rajapintoja.\n• Kehität **AWS**-ympäristöä.\n\n\n\n\n";
  expect(cleanJobDescriptionFormatting(input)).toBe("Roolisi meillä\n\n- Työsi vaikuttaa palveluihin.\n- Suunnittelet Node.js- ja TypeScript-pohjaisia API-rajapintoja.\n- Kehität AWS-ympäristöä.");
});

it("marks unbulleted requirements and benefits in a copied Finnish advert", () => {
  const input = "Odotamme sinulta\nkokemusta integraatioista\nsujuvaa suomen taitoa\nEduksi katsomme\nSnowflake-osaamisen\nBraze-kokemuksen\nMiksi tämä rooli?\nTässä pääset vaikuttamaan palveluihin.";
  expect(cleanJobDescriptionFormatting(input)).toBe("Odotamme sinulta\n\n- kokemusta integraatioista\n- sujuvaa suomen taitoa\n\nEduksi katsomme\n\n- Snowflake-osaamisen\n- Braze-kokemuksen\n\nMiksi tämä rooli?\n\nTässä pääset vaikuttamaan palveluihin.");
});
