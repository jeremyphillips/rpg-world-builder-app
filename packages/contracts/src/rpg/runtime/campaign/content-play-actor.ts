/** Query param for per-character catalog list filtering (PC play-actor scope). */
export const CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY = 'playActorCharacterId' as const

/**
 * Subject for play-visibility policy — controls whether published campaign content
 * may be consumed in character play (builder, Quick NPC, recommendations).
 */
export type ContentPlayActor = { kind: 'pc'; characterId: string } | { kind: 'npc' }

/** Parses the play-actor character id query param when present. */
export function parsePlayActorCharacterIdQuery(query: Record<string, unknown>): string | undefined {
  const raw = query[CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY]
  if (typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Narrows PC catalog discovery to a single play actor when requested.
 * Ignored for non-PC roles and when the id is not in the viewer's open controlled set.
 */
export function resolveCatalogFilterPcCharacterIds(input: {
  campaignRole: string
  pcCharacterIds: readonly string[]
  playActorCharacterId?: string
}): string[] {
  if (
    input.campaignRole === 'pc' &&
    input.playActorCharacterId &&
    input.pcCharacterIds.includes(input.playActorCharacterId)
  ) {
    return [input.playActorCharacterId]
  }

  return [...input.pcCharacterIds]
}
