const UUID_PATTERN = /^[0-9a-f-]{36}$/i

function compactId(entryId: string): string {
  return entryId.replace(/[^0-9a-z]/gi, '')
}

function uniquePrefixToken(compacted: string, peerCompacted: readonly string[]): string {
  for (let length = 4; length <= 8; length += 1) {
    const token = compacted.slice(0, length)
    const collision = peerCompacted.some((peer) => peer.slice(0, length) === token)
    if (!collision) return token
  }
  return compacted.slice(0, 8)
}

/** Short disambiguation token for equipment entry ids — never the full UUID. */
export function formatEquipmentEntryDisplayToken(
  entryId: string,
  peerEntryIds: readonly string[],
): string | undefined {
  const siblings = peerEntryIds.filter((id) => id !== entryId)
  if (siblings.length === 0) return undefined

  if (UUID_PATTERN.test(entryId)) {
    const compacted = compactId(entryId)
    const peerCompacted = siblings.filter((id) => UUID_PATTERN.test(id)).map((id) => compactId(id))
    return uniquePrefixToken(compacted, peerCompacted)
  }

  if (!siblings.includes(entryId)) return entryId

  const compacted = compactId(entryId)
  const peerCompacted = siblings.map((id) => compactId(id))
  return uniquePrefixToken(compacted, peerCompacted)
}
