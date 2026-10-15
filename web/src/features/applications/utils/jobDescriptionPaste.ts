type ListItem = { text: string; marker: string };

function comparable(value: string): string {
  return value.replace(/[\u00a0\u202f\u200b]/g, " ").replace(/\s+/g, " ").trim();
}

function listItemsFromHtml(html: string): ListItem[] {
  const document = new DOMParser().parseFromString(html, "text/html");
  return Array.from(document.querySelectorAll("li")).map(item => {
    const copy = item.cloneNode(true) as HTMLElement;
    copy.querySelectorAll("ul, ol").forEach(nested => nested.remove());
    const list = item.parentElement;
    const index = list ? Array.from(list.children).filter(child => child.tagName === "LI").indexOf(item) : -1;
    const start = list?.tagName === "OL" ? Number(list.getAttribute("start") ?? "1") : 1;
    return {
      text: comparable(copy.textContent ?? ""),
      marker: list?.tagName === "OL" && index >= 0 ? `${start + index}.` : "-",
    };
  }).filter(item => item.text);
}

// Textareas discard HTML list semantics on paste. Restore only list markers;
// retain the browser's plain text, spacing, and line breaks for the user's review.
export function restorePastedListMarkers(plainText: string, html: string): string {
  if (!plainText || !html || !/<li\b/i.test(html)) return plainText;
  const items = listItemsFromHtml(html);
  if (!items.length) return plainText;

  const lines = plainText.replace(/\r\n?/g, "\n").split("\n");
  let nextItem = 0;
  let changed = false;
  for (let index = 0; index < lines.length && nextItem < items.length; index += 1) {
    const line = lines[index];
    const marker = /^\s*(?:[-*+•●◦‣⁃–]|\d+[.)])\s+/.exec(line);
    const candidate = comparable(marker ? line.slice(marker[0].length) : line);
    if (!candidate) continue;
    const matchIndex = items.findIndex((item, position) => position >= nextItem && item.text === candidate);
    if (matchIndex < 0) continue;
    nextItem = matchIndex + 1;
    if (marker) continue;
    lines[index] = line.replace(/^(\s*)/, `$1${items[matchIndex].marker} `);
    changed = true;
  }
  return changed ? lines.join("\n") : plainText;
}
