const sectionHeading = /^(?:Roolisi meillä|Odotamme sinulta|Eduksi katsomme|Käytämme tällä hetkellä muun muassa seuraavia teknologioita ja työkaluja|Miksi tämä rooli\?|Mitä tarjoamme sinulle\?|Kiinnostuitko\?|Tässä tehtävässä|Responsibilities|Requirements|Key responsibilities(?: include but are not limited to)?|What you(?:'|’)ll bring|Considered as an advantage|We offer|Your role)\s*:?$/i;
const unmarkedListHeading = /^(?:Odotamme sinulta|Eduksi katsomme|Käytämme tällä hetkellä muun muassa seuraavia teknologioita ja työkaluja|Mitä tarjoamme sinulle\?|Requirements|Key responsibilities(?: include but are not limited to)?|What you(?:'|’)ll bring|Considered as an advantage)\s*:?$/i;
const listItem = /^\s*(?:-\s+|\d+[.)]\s+)\S/;

function normalizeLine(raw: string): { text: string; heading: boolean } {
  const line = raw.replace(/\u00a0|\u202f/g, " ").replace(/[\t ]+$/g, "").trimEnd();
  if (line.trim() === "\\") return { text: "", heading: false };
  const withoutBreak = line.replace(/\\\s*$/, "");
  const withoutMarkup = withoutBreak
    .replace(/\*\*(\S(?:.*?\S)?)\*\*/g, "$1")
    .replace(/^(\s*)#{1,6}\s+/, "$1");
  const heading = /^\s*(?:#{1,6}\s+|\*\*)/.test(line) || sectionHeading.test(withoutMarkup.trim());
  const text = withoutMarkup.replace(/^(\s*)(?:[-*+•●◦‣⁃–])\s+(?=\S)/, "$1- ").replace(/[\t ]+$/g, "");
  return { text, heading };
}

// Normalize copied formatting without joining sentences or changing the saved text automatically.
export function cleanJobDescriptionFormatting(value: string): string {
  const lines = value.replace(/\r\n?/g, "\n").split("\n").map(normalizeLine);
  const inferredItems = new Set<number>();

  for (let index = 0; index < lines.length; index += 1) {
    if (!unmarkedListHeading.test(lines[index].text.trim())) continue;
    let first = index + 1;
    while (first < lines.length && !lines[first].text.trim()) first += 1;
    let last = first;
    while (last < lines.length && lines[last].text.trim() && !lines[last].heading &&
      !listItem.test(lines[last].text) && lines[last].text.trim().length <= 220) last += 1;
    if (last - first >= 2) for (let item = first; item < last; item += 1) inferredItems.add(item);
  }

  const output: string[] = [];
  let previousKind: "heading" | "list" | "text" | "blank" = "blank";
  const blank = () => { if (output.length && output.at(-1) !== "") output.push(""); };

  lines.forEach((line, index) => {
    const text = inferredItems.has(index) ? `${line.text.match(/^\s*/)?.[0] ?? ""}- ${line.text.trimStart()}` : line.text;
    if (!text.trim()) { blank(); previousKind = "blank"; return; }
    const kind = line.heading ? "heading" : listItem.test(text) ? "list" : "text";
    if (kind === "heading" || (kind === "list" && previousKind === "text") ||
      (kind === "text" && previousKind === "list") || previousKind === "heading") blank();
    output.push(text);
    previousKind = kind;
  });

  while (output.at(-1) === "") output.pop();
  return output.join("\n");
}
