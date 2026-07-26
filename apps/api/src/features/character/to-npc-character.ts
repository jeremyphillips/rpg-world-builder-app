import { npcCharacterSchema, normalizeCharacterVital, type NpcCharacter } from '@rpg/contracts'

import type { CharacterSchemaType } from './character.model'

type CharacterRecord = CharacterSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
  lifecycle?: { vital?: unknown }
}

/** Maps a lean NPC document to the API `NpcCharacter` DTO. */
export function toNpcCharacter(doc: CharacterRecord): NpcCharacter {
  const rawVital = doc.vital ?? doc.lifecycle?.vital

  return npcCharacterSchema.parse({
    id: String(doc._id),
    characterType: 'npc',
    name: doc.name,
    imageKey: doc.imageKey ?? undefined,
    rulesetId: doc.rulesetId,
    classes: doc.classes,
    species: doc.species,
    alignment: doc.alignment,
    xp: doc.xp,
    abilityScores: doc.abilityScores,
    hitPoints: doc.hitPoints,
    proficiencies: doc.proficiencies,
    spells: doc.spells ?? [],
    equipment: doc.equipment,
    wealth: doc.wealth,
    narrative: doc.narrative ?? undefined,
    feats: doc.feats ?? [],
    vital: normalizeCharacterVital(rawVital),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  })
}

export function toNpcListCharacterSummary(npc: NpcCharacter) {
  return {
    id: npc.id,
    name: npc.name,
    vital: npc.vital,
    classes: npc.classes,
    species: npc.species,
  }
}
