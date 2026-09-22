import type { ContentPlayActor } from '@rpg/contracts'

/** Maps sheet subject to ContentPlayActor for relationship picker/availability. */
export function resolveRelationshipPlayActor(
  subjectKind: 'pc' | 'npc',
  characterId: string,
): ContentPlayActor {
  return subjectKind === 'npc' ? { kind: 'npc' } : { kind: 'pc', characterId }
}
