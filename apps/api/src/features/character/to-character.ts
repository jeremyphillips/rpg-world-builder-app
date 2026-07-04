import { pcCharacterSchema, type PcCharacter } from '@rpg/contracts'

import type { CharacterSchemaType } from './character.model'

type CharacterRecord = CharacterSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

/** Maps a lean character document to the API `PcCharacter` DTO. */
export function toCharacter(doc: CharacterRecord): PcCharacter {
  return pcCharacterSchema.parse({
    id: String(doc._id),
    characterType: 'pc',
    userId: doc.userId,
    campaignId: doc.campaignId ?? null,
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
    languages: doc.languages ?? [],
    spells: doc.spells ?? [],
    equipment: doc.equipment,
    wealth: doc.wealth,
    narrative: doc.narrative ?? undefined,
    feats: doc.feats ?? [],
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  })
}
