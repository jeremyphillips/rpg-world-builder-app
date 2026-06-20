import type { Armor } from '@rpg/contracts'
import {
  armorBodySchema,
  armorSchema,
  createArmorInputSchema,
  updateArmorInputSchema,
} from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { loadSeedArmor, seedArmorSlugs } from '@rpg/catalog/armor'
import { ArmorPatchModel } from './armor-patch.model'
import { HomebrewArmorModel, type HomebrewArmorSchemaType } from './homebrew-armor.model'

type HomebrewArmorRecord = HomebrewArmorSchemaType & { _id: unknown }

interface ArmorPatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

function toHomebrewArmor(doc: HomebrewDoc): Armor {
  const record = doc as HomebrewArmorRecord
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
    category: record.category,
    cost: record.cost as Armor['cost'],
    ...(record.weight != null && { weight: record.weight as Armor['weight'] }),
    ...(record.material !== undefined && { material: record.material }),
    ...(record.baseAc !== undefined && { baseAc: record.baseAc }),
    ...(record.acBonus !== undefined && { acBonus: record.acBonus }),
    addDexModifier: record.addDexModifier,
    ...(record.maxDexBonus !== undefined && { maxDexBonus: record.maxDexBonus }),
    stealthDisadvantage: record.stealthDisadvantage,
    ...(record.strengthRequirement !== undefined && {
      strengthRequirement: record.strengthRequirement,
    }),
  } as Armor
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
}

export const armorContentConfig: ContentTypeConfig<Armor> = {
  type: 'armor',
  loadSystem: loadSeedArmor,
  systemSlugs: seedArmorSlugs,
  loadPatches: async (campaignId) => {
    const docs = await ArmorPatchModel.find({ campaignId }).lean<ArmorPatchRecord[]>()
    return docs.map<OverlayPatch>((d) => ({ targetId: d.targetId, patch: d.patch }))
  },
  loadHomebrew: async (campaignId, rulesetId) => {
    const docs = await HomebrewArmorModel.find({ campaignId, rulesetId }).lean<
      HomebrewArmorRecord[]
    >()
    return docs.map(toHomebrewArmor)
  },
}

export const armorWriteConfig: ContentWriteConfig<Armor> = {
  typeName: 'armor',
  readConfig: armorContentConfig,
  responseKey: 'armor',
  createInputSchema: createArmorInputSchema,
  updateInputSchema: updateArmorInputSchema,
  storedSchema: armorSchema,
  bodySchema: armorBodySchema,
  homebrewModel: HomebrewArmorModel,
  patchModel: ArmorPatchModel,
  toHomebrewEntity: toHomebrewArmor,
  bodyFromCreateInput,
}
