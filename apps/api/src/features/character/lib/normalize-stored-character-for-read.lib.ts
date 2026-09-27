/** Fills minimize-stripped empty objects on read — not for create/update wire bodies. */
export function normalizeStoredCharacterRecordForRead<T extends StoredCharacterShape>(doc: T): T {
  return {
    ...doc,
    spells: normalizeStoredCharacterSpells(doc.spells),
    media: normalizeStoredCharacterMedia(doc.media),
  }
}

type StoredCharacterShape = {
  spells?: unknown[] | null
  media?: unknown
}

function normalizeStoredCharacterSpells(spells: unknown[] | null | undefined): unknown[] {
  if (!Array.isArray(spells)) return []

  return spells.map((spell) => {
    if (typeof spell !== 'object' || spell === null) return spell
    const entry = spell as Record<string, unknown>
    if ('access' in entry) return spell
    return { ...entry, access: {} }
  })
}

function normalizeStoredCharacterMedia(media: unknown): unknown {
  if (typeof media !== 'object' || media === null) return media
  const record = media as Record<string, unknown>
  if ('roles' in record) return media
  return { ...record, roles: {} }
}
