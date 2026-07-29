import { pcCharacterSchema, normalizeCharacterVital, type PcCharacter } from '@rpg/contracts'

import type { CharacterSchemaType } from './character.model'

type CharacterRecord = CharacterSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
  lifecycle?: { vital?: unknown }
}

/** Maps a lean character document to the API `PcCharacter` DTO. */
export function toCharacter(doc: CharacterRecord): PcCharacter {
  const rawVital = doc.vital ?? doc.lifecycle?.vital

  return pcCharacterSchema.parse({
    id: String(doc._id),
    characterType: 'pc',
    userId: doc.userId,
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
    connections: doc.connections ?? { organizations: [] },
    vital: normalizeCharacterVital(rawVital),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  })
}
