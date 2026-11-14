/** Supplemental prose after a mechanical sentence. Formatters do not call this. */
export function appendMonsterActionSupplementalText(
  mechanical: string,
  description: string | undefined,
): string {
  const extra = description
    ?.replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!extra) return mechanical
  return mechanical ? `${mechanical} ${extra}` : extra
}

/** Supplemental HTML after a generated spell body. Formatters do not call this. */
export function appendMonsterActionSupplementalHtml(
  bodyHtml: string,
  description: string | undefined,
): string {
  const extra = description?.trim()
  if (!extra) return bodyHtml
  return bodyHtml ? `${bodyHtml}${extra}` : extra
}
