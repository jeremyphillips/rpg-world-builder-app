import type { Spell } from '@rpg/contracts'
import {
  createSpellInputSchema,
  spellBodySchema,
  spellResolutionSchema,
  spellSchema,
  updateSpellInputSchema,
} from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
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
    id: String(record._id),
    slug: record.slug,
    rulesetId: record.rulesetId,
    source: 'homebrew',
    campaignId: record.campaignId,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    name: record.name,
    ...(record.imageKey !== undefined && { imageKey: record.imageKey }),
    ...(record.description !== undefined && { description: record.description }),
    school: record.school,
    level: record.level,
    classIds: record.classIds as Spell['classIds'],
    ...(record.tags !== undefined && { tags: record.tags as Spell['tags'] }),
    castingTime: record.castingTime as Spell['castingTime'],
    range: record.range as Spell['range'],
    duration: record.duration as Spell['duration'],
    components: record.components as Spell['components'],
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
    return docs.map<OverlayPatch>((d) => ({ targetId: d.targetId, patch: d.patch }))
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
  storedSchema: spellSchema,
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
