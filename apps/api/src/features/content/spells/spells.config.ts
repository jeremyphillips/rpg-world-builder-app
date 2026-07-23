import type { Spell } from '@rpg/contracts'
import {
  createSpellDraftInputSchema,
  createSpellInputSchema,
  spellBodySchema,
  spellDraftStoredSchema,
  spellResolutionSchema,
  spellSchema,
  updateSpellDraftInputSchema,
  updateSpellInputSchema,
} from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { homebrewContentEnvelope } from '../lib/homebrew-envelope'
import { loadSeedSpells, seedSpellSlugs } from '@rpg/catalog/spells'
import { spellValidateBeforeWrite } from './spell-write-hooks'
import { stripNullDeep } from '../lib/strip-null-deep'
import { HomebrewSpellModel, type HomebrewSpellSchemaType } from './homebrew-spell.model'
import { SpellPatchModel } from './spell-patch.model'

type HomebrewSpellRecord = HomebrewSpellSchemaType & { _id: unknown }

interface SpellPatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

function toHomebrewSpell(doc: HomebrewDoc): Spell {
  const record = doc as HomebrewSpellRecord
  return {
    ...homebrewContentEnvelope(record),
    name: record.name,
    ...(record.imageKey !== undefined && { imageKey: record.imageKey }),
    ...(record.description !== undefined && { description: record.description }),
    school: record.school,
    ...(record.level != null && { level: record.level }),
    ...(record.classIds != null && { classIds: record.classIds as Spell['classIds'] }),
    ...(record.tags !== undefined && { tags: record.tags as Spell['tags'] }),
    ...(record.castingTime != null && { castingTime: record.castingTime as Spell['castingTime'] }),
    ...(record.range != null && { range: record.range as Spell['range'] }),
    ...(record.duration != null && { duration: record.duration as Spell['duration'] }),
    ...(record.components != null && { components: record.components as Spell['components'] }),
    ...(record.deliveryMethod !== undefined && { deliveryMethod: record.deliveryMethod }),
    ...(record.areaOfEffect !== undefined && {
      areaOfEffect: record.areaOfEffect as Spell['areaOfEffect'],
    }),
    ...(record.cantripScaling !== undefined && { cantripScaling: record.cantripScaling }),
    ...(record.higherLevelSlotEffect !== undefined && {
      higherLevelSlotEffect: record.higherLevelSlotEffect,
    }),
    ...(record.resolution != null && {
      resolution: spellResolutionSchema.parse(stripNullDeep(record.resolution)),
    }),
  } as Spell
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
}

export const spellContentConfig: ContentTypeConfig<Spell> = {
  type: 'spells',
  patchReplaceKeys: ['resolution'],
  loadSystem: loadSeedSpells,
  systemSlugs: seedSpellSlugs,
  loadPatches: async (campaignId) => {
    const docs = await SpellPatchModel.find({ campaignId }).lean<SpellPatchRecord[]>()
    return docs.map<OverlayPatch>((d) => ({
      targetId: d.targetId,
      patch: stripNullDeep(d.patch),
    }))
  },
  loadHomebrew: async (campaignId, rulesetId) => {
    const docs = await HomebrewSpellModel.find({ campaignId, rulesetId }).lean<
      HomebrewSpellRecord[]
    >()
    return docs.map(toHomebrewSpell)
  },
}

export const spellWriteConfig: ContentWriteConfig<Spell> = {
  typeName: 'spells',
  readConfig: spellContentConfig,
  responseKey: 'spells',
  createInputSchema: createSpellInputSchema,
  updateInputSchema: updateSpellInputSchema,
  createDraftInputSchema: createSpellDraftInputSchema,
  updateDraftInputSchema: updateSpellDraftInputSchema,
  storedSchema: spellSchema,
  draftStoredSchema: spellDraftStoredSchema,
  bodySchema: spellBodySchema,
  homebrewModel: HomebrewSpellModel,
  patchModel: SpellPatchModel,
  toHomebrewEntity: toHomebrewSpell,
  bodyFromCreateInput,
  validateBeforeWrite: spellValidateBeforeWrite,
}

export const spellRegistration = {
  read: spellContentConfig,
  write: spellWriteConfig,
} as const
