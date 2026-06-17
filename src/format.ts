/** Format a number with comma separators: 262144 → "262,144" */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/**
 * Compact a token count for dense display: 262144 → "262K", 1000000 → "1M",
 * 1500000 → "1.5M". Values under 1000 are passed through `formatNumber`.
 */
export function compactCount(n: number): string {
  // Round to thousands first so values like 999_999 (→ 1000K) roll over into
  // the millions branch instead of rendering an awkward "1000K".
  const thousands = Math.round(n / 1000);
  if (thousands >= 1000) {
    const m = thousands / 1000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (n >= 1_000) return `${thousands}K`;
  return formatNumber(n);
}

/** Format bytes as human-readable: 20285680936 → "18.9 GB" */
export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Extract owner from model ID (e.g., "qwen" from "qwen/qwen3-30b").
 * Returns undefined if there's no slash separator.
 */
export function extractModelOwner(id: string): string | undefined {
  const slash = id.indexOf("/");
  return slash > 0 ? id.slice(0, slash) : undefined;
}

/** Acronyms that should be uppercased in model names. */
const ACRONYMS = new Set([
  "gpt",
  "oss",
  "api",
  "gguf",
  "ggml",
  "nomic",
  "vl",
  "it",
  "mlx",
]);

/**
 * Format model ID for display.
 * Turns "qwen/qwen3-30b-a3b" into "Qwen3 30B A3B".
 */
export function formatModelName(id: string): string {
  // Extract part after slash (if any)
  const slash = id.indexOf("/");
  const modelPart = slash > 0 ? id.slice(slash + 1) : id;

  return modelPart
    .split(/[-_:]/)
    .filter(Boolean)
    .map((token) => {
      const lower = token.toLowerCase();
      if (ACRONYMS.has(lower)) return token.toUpperCase();
      // Size suffixes like "30b", "7b", "0.6b"
      if (/^\d+\.?\d*[bkmg]$/i.test(token)) return token.toUpperCase();
      // Quantization like "q4", "q8"
      if (/^q\d+$/i.test(token)) return token.toUpperCase();
      // Version numbers like "3.2"
      if (/^\d+\.\d+/.test(token)) return token;
      // Patterns like "a3b", "3n"
      if (/^[a-z]\d+[a-z]$/i.test(token) || /^\d+[a-z]$/i.test(token))
        return token.toUpperCase();
      // Default: capitalize first letter
      return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
    })
    .join(" ");
}
