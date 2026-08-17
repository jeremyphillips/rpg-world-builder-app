/** Query param for per-character catalog list filtering (PC play-actor scope). */
export const CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY = 'playActorCharacterId' as const

/** Query param for non-PC play actors on builder/play catalog requests. */
export const CONTENT_PLAY_ACTOR_KIND_QUERY = 'playActorKind' as const

export const CONTENT_PLAY_ACTOR_KINDS = ['new_pc', 'npc'] as const
export type ContentPlayActorKind = (typeof CONTENT_PLAY_ACTOR_KINDS)[number]

/**
 * Subject for play-visibility policy — controls whether published campaign content
 * may be consumed in character play (builder, Quick NPC, recommendations).
 */
export type ContentPlayActor =
  | { kind: 'pc'; characterId: string }
  | { kind: 'new_pc' }
  | { kind: 'npc' }

export type PlayActorQueryParseErrorCode =
  | 'missing_play_actor'
  | 'invalid_play_actor_kind'
  | 'empty_play_actor_character_id'
  | 'conflicting_play_actor_params'

export type PlayActorQueryParseError = {
  code: PlayActorQueryParseErrorCode
  message: string
}

export type PlayActorQueryParseResult =
  | { ok: true; playActor: ContentPlayActor }
  | { ok: false; error: PlayActorQueryParseError }

function readPlayActorCharacterIdQuery(
  query: Record<string, unknown>,
): { kind: 'absent' } | { kind: 'empty' } | { kind: 'present'; characterId: string } {
  const raw = query[CONTENT_PLAY_ACTOR_CHARACTER_ID_QUERY]
  if (raw === undefined) {
    return { kind: 'absent' }
  }
  if (typeof raw !== 'string') {
    return { kind: 'empty' }
  }
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return { kind: 'empty' }
  }
  return { kind: 'present', characterId: trimmed }
}

function readPlayActorKindQuery(
  query: Record<string, unknown>,
): { kind: 'absent' } | { kind: 'empty' } | { kind: 'present'; value: string } {
  const raw = query[CONTENT_PLAY_ACTOR_KIND_QUERY]
  if (raw === undefined) {
    return { kind: 'absent' }
  }
  if (typeof raw !== 'string') {
    return { kind: 'empty' }
  }
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return { kind: 'empty' }
  }
  return { kind: 'present', value: trimmed }
}

/** Parses the play-actor character id query param when present. */
export function parsePlayActorCharacterIdQuery(query: Record<string, unknown>): string | undefined {
  const parsed = readPlayActorCharacterIdQuery(query)
  return parsed.kind === 'present' ? parsed.characterId : undefined
}

function parsePlayActorKindQuery(query: Record<string, unknown>): ContentPlayActorKind | undefined {
  const parsed = readPlayActorKindQuery(query)
  if (parsed.kind !== 'present') {
    return undefined
  }
  if (parsed.value === 'new_pc' || parsed.value === 'npc') {
    return parsed.value
  }
  return undefined
}

/**
 * Optional play-actor scope for general discovery/list routes.
 * Absence means callers apply the default discovery filter.
 */
export function parseOptionalPlayActorFromQuery(
  query: Record<string, unknown>,
): ContentPlayActor | undefined {
  const characterId = parsePlayActorCharacterIdQuery(query)
  const playActorKind = parsePlayActorKindQuery(query)

  if (characterId) {
    return { kind: 'pc', characterId }
  }
  if (playActorKind === 'new_pc') {
    return { kind: 'new_pc' }
  }
  if (playActorKind === 'npc') {
    return { kind: 'npc' }
  }

  return undefined
}

/**
 * Required play-actor scope for builder/play catalog routes.
 * Missing or malformed actor context fails closed — never falls back to discovery.
 */
export function requirePlayActorFromQuery(
  query: Record<string, unknown>,
): PlayActorQueryParseResult {
  const characterIdQuery = readPlayActorCharacterIdQuery(query)
  const kindQuery = readPlayActorKindQuery(query)

  const hasCharacterId = characterIdQuery.kind === 'present' || characterIdQuery.kind === 'empty'
  const hasKind = kindQuery.kind === 'present' || kindQuery.kind === 'empty'

  if (hasCharacterId && hasKind) {
    return {
      ok: false,
      error: {
        code: 'conflicting_play_actor_params',
        message: 'playActorKind and playActorCharacterId are mutually exclusive.',
      },
    }
  }

  if (characterIdQuery.kind === 'empty') {
    return {
      ok: false,
      error: {
        code: 'empty_play_actor_character_id',
        message: 'playActorCharacterId must be a non-empty string.',
      },
    }
  }

  if (kindQuery.kind === 'empty') {
    return {
      ok: false,
      error: {
        code: 'invalid_play_actor_kind',
        message: 'playActorKind must be a non-empty string.',
      },
    }
  }

  if (characterIdQuery.kind === 'present') {
    return { ok: true, playActor: { kind: 'pc', characterId: characterIdQuery.characterId } }
  }

  if (kindQuery.kind === 'present') {
    if (kindQuery.value === 'new_pc') {
      return { ok: true, playActor: { kind: 'new_pc' } }
    }
    if (kindQuery.value === 'npc') {
      return { ok: true, playActor: { kind: 'npc' } }
    }
    return {
      ok: false,
      error: {
        code: 'invalid_play_actor_kind',
        message: `Invalid playActorKind "${kindQuery.value}". Expected new_pc or npc.`,
      },
    }
  }

  return {
    ok: false,
    error: {
      code: 'missing_play_actor',
      message: 'Builder catalog requests require playActorKind or playActorCharacterId.',
    },
  }
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
