import {
  CONTENT_MEDIA_REPLACE_KEY,
  createMonsterDraftInputSchema,
  createMonsterInputSchema,
  monsterBodySchema,
  monsterDraftStoredSchema,
  monsterSchema,
  normalizeLegacyMonsterDocument,
  updateMonsterDraftInputSchema,
  updateMonsterInputSchema,
  type Monster,
} from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { homebrewContentEnvelope } from '../lib/homebrew-envelope'
import { loadSeedMonsters, seedMonsterSlugs } from '@rpg/catalog/monsters'
import { monstersValidateBeforeWrite } from './monsters-write-hooks'
import { HomebrewMonsterModel, type HomebrewMonsterSchemaType } from './homebrew-monster.model'
import { MonsterPatchModel } from './monster-patch.model'

type HomebrewMonsterRecord = HomebrewMonsterSchemaType & { _id: unknown }

interface MonsterPatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function homebrewLeanDocumentToRaw(record: HomebrewMonsterRecord): Record<string, unknown> {
  return {
    ...(record.media !== undefined && { media: record.media }),
    ...(record.description !== undefined && { description: record.description }),
    size: record.size,
    creatureType: record.creatureType,
    alignment: record.alignment,
    abilityScores: record.abilityScores,
    armorClass: record.armorClass,
    hitPoints: record.hitPoints,
    movement: record.movement,
    ...(record.hover !== undefined && { hover: record.hover }),
    senses: record.senses,
    languages: record.languages,
    communication: record.communication,
    challengeRating: record.challengeRating,
    ...(record.experiencePointsOverride !== undefined && {
      experiencePointsOverride: record.experiencePointsOverride,
    }),
    proficiencies: record.proficiencies,
    defenses: record.defenses,
    equipment: record.equipment,
    traits: record.traits,
    actions: record.actions,
    bonusActions: record.bonusActions,
    reactions: record.reactions,
  }
}

function toHomebrewMonster(doc: HomebrewDoc): Monster {
  const record = doc as HomebrewMonsterRecord
  const normalized = normalizeLegacyMonsterDocument(homebrewLeanDocumentToRaw(record))

  return {
    ...homebrewContentEnvelope(record),
    name: record.name,
    ...(normalized.media !== undefined && { media: normalized.media as Monster['media'] }),
    ...(normalized.description !== undefined && {
      description: normalized.description as string,
    }),
    size: normalized.size as Monster['size'],
    creatureType: normalized.creatureType as string,
    alignment: normalized.alignment as Monster['alignment'],
    abilityScores: normalized.abilityScores as Monster['abilityScores'],
    armorClass: normalized.armorClass as Monster['armorClass'],
    hitPoints: normalized.hitPoints as Monster['hitPoints'],
    movement: normalized.movement as Monster['movement'],
    ...(normalized.hover !== undefined && { hover: normalized.hover as boolean }),
    senses: (normalized.senses ?? []) as Monster['senses'],
    communication: (normalized.communication ?? {}) as Monster['communication'],
    challengeRating: normalized.challengeRating as Monster['challengeRating'],
    ...(normalized.experiencePointsOverride !== undefined && {
      experiencePointsOverride: normalized.experiencePointsOverride as number,
    }),
    proficiencies: normalized.proficiencies as Monster['proficiencies'],
    defenses: normalized.defenses as Monster['defenses'],
    equipment: (normalized.equipment ?? []) as Monster['equipment'],
    traits: (normalized.traits ?? []) as Monster['traits'],
    actions: (normalized.actions ?? []) as Monster['actions'],
    bonusActions: (normalized.bonusActions ?? []) as Monster['bonusActions'],
    reactions: (normalized.reactions ?? []) as Monster['reactions'],
  } as Monster
}

function prepareHomebrewMonsterUpdate(
  _doc: HomebrewDoc,
  update: Record<string, unknown>,
): Record<string, unknown> {
  const proficiencies = update.proficiencies
  if (isRecord(proficiencies) && Object.prototype.hasOwnProperty.call(proficiencies, 'languages')) {
    return { ...update, languages: null }
  }
  return update
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
}

const MONSTER_PATCH_REPLACE_KEYS = [
  CONTENT_MEDIA_REPLACE_KEY,
  'armorClass',
  'hitPoints',
  'movement',
  'communication',
] as const

export const monstersContentConfig: ContentTypeConfig<Monster> = {
  type: 'monsters',
  patchReplaceKeys: [...MONSTER_PATCH_REPLACE_KEYS],
  system: {
    load: loadSeedMonsters,
    slugs: seedMonsterSlugs,
    loadPatches: async (campaignId) => {
      const docs = await MonsterPatchModel.find({ campaignId }).lean<MonsterPatchRecord[]>()
      return docs.map<OverlayPatch>((d) => ({ targetId: d.targetId, patch: d.patch }))
    },
  },
  loadHomebrew: async (campaignId, rulesetId) => {
    const docs = await HomebrewMonsterModel.find({ campaignId, rulesetId }).lean<
      HomebrewMonsterRecord[]
    >()
    return docs.map(toHomebrewMonster)
  },
}

export const monstersWriteConfig: ContentWriteConfig<Monster> = {
  typeName: 'monsters',
  readConfig: monstersContentConfig,
  responseKey: 'monsters',
  createInputSchema: createMonsterInputSchema,
  updateInputSchema: updateMonsterInputSchema,
  createDraftInputSchema: createMonsterDraftInputSchema,
  updateDraftInputSchema: updateMonsterDraftInputSchema,
  storedSchema: monsterSchema,
  draftStoredSchema: monsterDraftStoredSchema,
  bodySchema: monsterBodySchema,
  homebrewModel: HomebrewMonsterModel,
  patchModel: MonsterPatchModel,
  toHomebrewEntity: toHomebrewMonster,
  prepareHomebrewUpdate: prepareHomebrewMonsterUpdate,
  bodyFromCreateInput,
  validateBeforeWrite: monstersValidateBeforeWrite,
  patchReplaceKeys: [...MONSTER_PATCH_REPLACE_KEYS],
  patchTombstoneKeys: ['experiencePointsOverride', 'hover', 'description'],
}

export const monstersRegistration = {
  read: monstersContentConfig,
  write: monstersWriteConfig,
} as const
