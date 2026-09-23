// Parseador de archivos .lrc
export function parseLRC(text) {
  const lines = text.split(/\r?\n/);
  return lines.map(line => {
    // [mm:ss] o [mm:ss.xx]
    const match = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/);
    if (match) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const ms = parseInt(match[3] || "0", 10);
      return {
        start: min * 60 + sec + ms / 1000,
        text: match[4].trim(),
      };
    }
    return null;
  }).filter(Boolean);
}

// Parseador de archivos .srt
export function parseSRT(text) {
  const blocks = text.split(/\r?\n\r?\n/); // cada bloque
  return blocks.map(block => {
    const lines = block.split(/\r?\n/);
    if (lines.length >= 3) {
      const timeMatch = lines[1].match(
        /(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/
      );
      if (timeMatch) {
        const start =
          parseInt(timeMatch[1], 10) * 3600 +
          parseInt(timeMatch[2], 10) * 60 +
          parseInt(timeMatch[3], 10) +
          parseInt(timeMatch[4], 10) / 1000;
        const end =
          parseInt(timeMatch[5], 10) * 3600 +
          parseInt(timeMatch[6], 10) * 60 +
          parseInt(timeMatch[7], 10) +
          parseInt(timeMatch[8], 10) / 1000;

        const textContent = lines
          .slice(2)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        return { start, end, text: textContent };
      }
    }
    return null;
  }).filter(Boolean);
}
