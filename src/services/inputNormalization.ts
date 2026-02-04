function clampMaxLen(value: string, maxLen?: number): string {
  if (typeof maxLen !== "number" || !Number.isFinite(maxLen) || maxLen <= 0) return value;
  return value.length > maxLen ? value.slice(0, maxLen) : value;
}

export function normalizeSingleLineText(value: string, opts?: { maxLen?: number }): string {
  // Preserve user intent but remove surrounding whitespace and collapse internal whitespace.
  // Intended for single-line fields rendered via <Input />.
  const normalized = value.replace(/\s+/g, " ").trim();
  return clampMaxLen(normalized, opts?.maxLen);
}

export function normalizeRequiredTitle(value: string, fallback: string, opts?: { maxLen?: number }): string {
  const normalized = normalizeSingleLineText(value, opts);
  const chosen = normalized.length > 0 ? normalized : fallback;
  return clampMaxLen(chosen, opts?.maxLen);
}

export function normalizeOptionalSingleLineText(value: string, opts?: { maxLen?: number }): string | null {
  const normalized = normalizeSingleLineText(value, opts);
  return normalized.length > 0 ? normalized : null;
}

export function normalizeDateInputToIso(dateInput: string): string | null {
  const normalized = normalizeSingleLineText(dateInput);
  if (!normalized) return null;

  // Expect browser <input type="date"/> format.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;

  const date = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}
