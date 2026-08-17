import type { ContentPlayActor } from '@rpg/contracts'

export type AuthorizePlayActorCharacterIdInput = {
  playActor: ContentPlayActor
  pcCharacterIds: readonly string[]
}

export type AuthorizePlayActorCharacterIdResult = { ok: true } | { ok: false }

/**
 * Ensures a PC play actor is in the requester's authorized controlled set before
 * applying specific_players grants. Non-PC actors skip this check.
 */
export function authorizePlayActorCharacterId(
  input: AuthorizePlayActorCharacterIdInput,
): AuthorizePlayActorCharacterIdResult {
  if (input.playActor.kind !== 'pc') {
    return { ok: true }
  }

  if (input.pcCharacterIds.includes(input.playActor.characterId)) {
    return { ok: true }
  }

  return { ok: false }
}
