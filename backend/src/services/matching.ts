export function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}
export function matches(
  text: string,
  words: string[],
  excluded: string[],
  mode: string,
) {
  const t = normalize(text);
  if (excluded.some((w) => t.includes(normalize(w)))) return false;
  return mode === "ALL"
    ? words.every((w) => t.includes(normalize(w)))
    : words.some((w) => t.includes(normalize(w)));
}

// Compare content blocks, not whether a keyword existed anywhere before.
// A new edital can repeat the same course name already present on the page.
export function changedMatchingText(
  current: string,
  previous: string,
  keywords: string[],
) {
  const oldBlocks = new Set(previous.split(/\n+/).map(normalize));
  return current
    .split(/\n+/)
    .filter((block) => {
      const text = normalize(block);
      return (
        text &&
        !oldBlocks.has(text) &&
        keywords.some((word) => text.includes(normalize(word)))
      );
    })
    .join("\n");
}
