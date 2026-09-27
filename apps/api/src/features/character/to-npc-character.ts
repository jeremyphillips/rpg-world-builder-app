import {
  npcCharacterSchema,
  normalizeCharacterVital,
  normalizeStoredCharacterGender,
  type NpcCharacter,
} from '@rpg/contracts'

import { normalizeStoredCharacterRecordForRead } from './lib/normalize-stored-character-for-read.lib'
import { resolveCharacterDisplayImageForSurface } from './lib/resolve-character-display-image.lib'
import type { CharacterSchemaType } from './character.model'

type CharacterRecord = CharacterSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
  lifecycle?: { vital?: unknown }
}

/** Maps a lean NPC document to the API `NpcCharacter` DTO. */
export function toNpcCharacter(doc: CharacterRecord): NpcCharacter {
  const normalized = normalizeStoredCharacterRecordForRead(doc)
  const rawVital = normalized.vital ?? normalized.lifecycle?.vital

  return npcCharacterSchema.parse({
    id: String(normalized._id),
    characterType: 'npc',
    name: normalized.name,
    media: normalized.media ?? undefined,
    rulesetId: normalized.rulesetId,
    classes: normalized.classes,
    species: normalized.species,
    alignment: normalized.alignment,
    gender: normalizeStoredCharacterGender(normalized.gender),
    xp: normalized.xp,
    abilityScores: normalized.abilityScores,
    hitPoints: normalized.hitPoints,
    proficiencies: normalized.proficiencies,
    spells: normalized.spells ?? [],
    equipment: normalized.equipment,
    wealth: normalized.wealth,
    narrative: normalized.narrative ?? undefined,
    feats: normalized.feats ?? [],
    vital: normalizeCharacterVital(rawVital),
    createdAt: normalized.createdAt.toISOString(),
    updatedAt: normalized.updatedAt.toISOString(),
  })
}

export function toNpcListCharacterSummary(npc: NpcCharacter) {
  const displayImage = resolveCharacterDisplayImageForSurface(npc, 'compact')

  return {
    id: npc.id,
    name: npc.name,
    vital: npc.vital,
    classes: npc.classes,
    species: npc.species,
    ...(displayImage ? { displayImage } : {}),
  }
}
