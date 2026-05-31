export function downloadMarkdown(content: string, filename = "spec.md"): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function buildFilename(spec: string): string {
  const titleMatch = spec.match(/^#\s+(.+)/m);
  if (!titleMatch) return "spec.md";
  const title = titleMatch[1]
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
  return `${title}.md`;
}
