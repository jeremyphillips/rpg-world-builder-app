import { npcCharacterSchema, normalizeCharacterLifecycle, type NpcCharacter } from '@rpg/contracts'

import type { CharacterSchemaType } from './character.model'

type CharacterRecord = CharacterSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

/** Maps a lean NPC document to the API `NpcCharacter` DTO. */
export function toNpcCharacter(doc: CharacterRecord): NpcCharacter {
  return npcCharacterSchema.parse({
    id: String(doc._id),
    characterType: 'npc',
    campaignId: doc.campaignId,
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
    lifecycle: normalizeCharacterLifecycle(doc.lifecycle),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  })
}
