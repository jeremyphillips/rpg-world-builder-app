import type { CharacterKind, ContentPlayActor } from '@rpg/contracts'

/** Maps sheet subject to ContentPlayActor for relationship picker/availability. */
export function resolveRelationshipPlayActor(
  subjectKind: CharacterKind,
  characterId: string,
): ContentPlayActor {
  return subjectKind === 'npc' ? { kind: 'npc' } : { kind: 'pc', characterId }
}
