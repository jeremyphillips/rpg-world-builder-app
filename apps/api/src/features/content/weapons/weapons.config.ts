import type { Weapon } from '@rpg/contracts'
import {
  createWeaponInputSchema,
  updateWeaponInputSchema,
  weaponBodySchema,
  weaponSchema,
} from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { loadSeedWeapons, seedWeaponSlugs } from '@rpg/catalog/weapons'
import { HomebrewWeaponModel, type HomebrewWeaponSchemaType } from './homebrew-weapon.model'
import { WeaponPatchModel } from './weapon-patch.model'

type HomebrewWeaponRecord = HomebrewWeaponSchemaType & { _id: unknown }

interface WeaponPatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

function toHomebrewWeapon(doc: HomebrewDoc): Weapon {
  const record = doc as HomebrewWeaponRecord
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
    mode: record.mode,
    cost: record.cost as Weapon['cost'],
    ...(record.weight != null && { weight: record.weight as Weapon['weight'] }),
    ...(record.damage != null && { damage: record.damage as Weapon['damage'] }),
    ...(record.damageType !== undefined && { damageType: record.damageType }),
    ...(record.versatileDamage != null && {
      versatileDamage: record.versatileDamage as Weapon['versatileDamage'],
    }),
    properties: record.properties ?? [],
    mastery: record.mastery,
    ...(record.range != null && { range: record.range as Weapon['range'] }),
    ...(record.specialRules !== undefined && { specialRules: record.specialRules }),
  } as Weapon
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
}

export const weaponsContentConfig: ContentTypeConfig<Weapon> = {
  type: 'weapons',
  loadSystem: loadSeedWeapons,
  systemSlugs: seedWeaponSlugs,
  loadPatches: async (campaignId) => {
    const docs = await WeaponPatchModel.find({ campaignId }).lean<WeaponPatchRecord[]>()
    return docs.map<OverlayPatch>((d) => ({ targetId: d.targetId, patch: d.patch }))
  },
  loadHomebrew: async (campaignId, rulesetId) => {
    const docs = await HomebrewWeaponModel.find({ campaignId, rulesetId }).lean<
      HomebrewWeaponRecord[]
    >()
    return docs.map(toHomebrewWeapon)
  },
}

export const weaponsWriteConfig: ContentWriteConfig<Weapon> = {
  typeName: 'weapons',
  readConfig: weaponsContentConfig,
  responseKey: 'weapons',
  createInputSchema: createWeaponInputSchema,
  updateInputSchema: updateWeaponInputSchema,
  storedSchema: weaponSchema,
  bodySchema: weaponBodySchema,
  homebrewModel: HomebrewWeaponModel,
  patchModel: WeaponPatchModel,
  toHomebrewEntity: toHomebrewWeapon,
  bodyFromCreateInput,
}
