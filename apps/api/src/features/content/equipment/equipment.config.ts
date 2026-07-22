import type { Equipment } from '@rpg/contracts'
import {
  createEquipmentInputSchema,
  equipmentBodySchema,
  equipmentSchema,
  updateEquipmentInputSchema,
} from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { homebrewContentEnvelope } from '../lib/homebrew-envelope'
import { loadSeedEquipment, seedEquipmentSlugs } from '@rpg/catalog/equipment'
import { EquipmentPatchModel } from './equipment-patch.model'
import {
  HomebrewEquipmentModel,
  type HomebrewEquipmentSchemaType,
} from './homebrew-equipment.model'

type HomebrewEquipmentRecord = HomebrewEquipmentSchemaType & { _id: unknown }

interface EquipmentPatchRecord {
  targetId: string
  patch: Record<string, unknown>
}

const HOMEBREW_DOC_ENVELOPE_KEYS = new Set([
  '_id',
  'campaignId',
  'rulesetId',
  'slug',
  'status',
  'createdAt',
  'updatedAt',
  '__v',
])

function toHomebrewEquipment(doc: HomebrewDoc): Equipment {
  const record = doc as HomebrewEquipmentRecord
  const body = Object.fromEntries(
    Object.entries(record).filter(([key]) => !HOMEBREW_DOC_ENVELOPE_KEYS.has(key)),
  )
  return {
    ...homebrewContentEnvelope(record),
    ...body,
  } as Equipment
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, ...body } = input
  return body
}

export const equipmentContentConfig: ContentTypeConfig<Equipment> = {
  type: 'equipment',
  loadSystem: loadSeedEquipment,
  systemSlugs: seedEquipmentSlugs,
  loadPatches: async (campaignId) => {
    const docs = await EquipmentPatchModel.find({ campaignId }).lean<EquipmentPatchRecord[]>()
    return docs.map<OverlayPatch>((d) => ({ targetId: d.targetId, patch: d.patch }))
  },
  loadHomebrew: async (campaignId, rulesetId) => {
    const docs = await HomebrewEquipmentModel.find({ campaignId, rulesetId }).lean<
      HomebrewEquipmentRecord[]
    >()
    return docs.map(toHomebrewEquipment)
  },
}

export const equipmentWriteConfig: ContentWriteConfig<Equipment> = {
  typeName: 'equipment',
  readConfig: equipmentContentConfig,
  responseKey: 'equipment',
  createInputSchema: createEquipmentInputSchema,
  updateInputSchema: updateEquipmentInputSchema,
  storedSchema: equipmentSchema,
  bodySchema: equipmentBodySchema,
  homebrewModel: HomebrewEquipmentModel,
  patchModel: EquipmentPatchModel,
  toHomebrewEntity: toHomebrewEquipment,
  bodyFromCreateInput,
}

export const equipmentRegistration = {
  read: equipmentContentConfig,
  write: equipmentWriteConfig,
} as const
