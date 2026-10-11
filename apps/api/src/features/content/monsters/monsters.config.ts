import type { Monster } from '@rpg/contracts'
import { CONTENT_MEDIA_REPLACE_KEY } from '@rpg/contracts'
import {
  createMonsterDraftInputSchema,
  createMonsterInputSchema,
  monsterBodySchema,
  monsterDraftStoredSchema,
  monsterSchema,
  updateMonsterDraftInputSchema,
  updateMonsterInputSchema,
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

function toHomebrewMonster(doc: HomebrewDoc): Monster {
  const record = doc as HomebrewMonsterRecord
  return {
    ...homebrewContentEnvelope(record),
    name: record.name,
    ...(record.media !== undefined && { media: record.media }),
    ...(record.description !== undefined && { description: record.description }),
    size: record.size as Monster['size'],
    creatureType: record.creatureType as string,
    alignment: record.alignment as Monster['alignment'],
    abilityScores: record.abilityScores as Monster['abilityScores'],
    armorClass: record.armorClass as Monster['armorClass'],
    hitPoints: record.hitPoints as Monster['hitPoints'],
    movement: record.movement as Monster['movement'],
    ...(record.hover !== undefined && { hover: record.hover }),
    senses: (record.senses ?? []) as Monster['senses'],
    languages: record.languages as Monster['languages'],
    challengeRating: record.challengeRating as Monster['challengeRating'],
    ...(record.experiencePointsOverride !== undefined && {
      experiencePointsOverride: record.experiencePointsOverride,
    }),
    proficiencies: record.proficiencies as Monster['proficiencies'],
    defenses: record.defenses as Monster['defenses'],
    equipment: (record.equipment ?? []) as Monster['equipment'],
    traits: (record.traits ?? []) as Monster['traits'],
    actions: (record.actions ?? []) as Monster['actions'],
    bonusActions: (record.bonusActions ?? []) as Monster['bonusActions'],
    reactions: (record.reactions ?? []) as Monster['reactions'],
  } as Monster
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
}

export const monstersContentConfig: ContentTypeConfig<Monster> = {
  type: 'monsters',
  patchReplaceKeys: [CONTENT_MEDIA_REPLACE_KEY],
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
  bodyFromCreateInput,
  validateBeforeWrite: monstersValidateBeforeWrite,
}

export const monstersRegistration = {
  read: monstersContentConfig,
  write: monstersWriteConfig,
} as const
