/** Normalize a voice transcript: trim, lowercase, remove accents, collapse spaces. */
export function normalizeName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

/** Convert a normalized name to a stable pseudo-barcode (prefix `voice:`). */
export function toPseudoBarcode(normalized: string): string {
  const slug = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `voice:${slug || 'item'}`
}
