export function generateDefaultMonogram(name: string): string {
  if (!name.trim()) return "";

  const cleaned = name.trim();

  if (cleaned.includes("&")) {
    const parts = cleaned.split("&").map((part) => part.trim());

    if (parts[0] && parts[1]) {
      return `${parts[0].charAt(0).toUpperCase()} & ${parts[1].charAt(0).toUpperCase()}`;
    }
  }

  const andMatch = cleaned.match(/^(.+?)\s+(?:and|và|\+)\s+(.+)$/i);

  if (andMatch?.[1] && andMatch[2]) {
    return `${andMatch[1].trim().charAt(0).toUpperCase()} & ${andMatch[2].trim().charAt(0).toUpperCase()}`;
  }

  const words = cleaned.split(/\s+/).filter(Boolean);

  if (words[0] && words[1]) {
    return `${words[0].charAt(0).toUpperCase()}${words[1].charAt(0).toUpperCase()}`;
  }

  return cleaned.slice(0, 2).toUpperCase();
}
