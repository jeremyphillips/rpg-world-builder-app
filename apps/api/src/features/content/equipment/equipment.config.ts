import type { Equipment, EquipmentKind } from '@rpg/contracts'
import {
  createEquipmentInputSchema,
  equipmentBodySchema,
  equipmentSchema,
  updateEquipmentInputSchema,
} from '@rpg/contracts'

import type { ContentTypeConfig } from '../lib/content-type-config'
import type { ContentWriteConfig, HomebrewDoc } from '../lib/content-write-config'
import type { OverlayPatch } from '../lib/resolve-catalog'
import { deepMerge } from '../lib/deep-merge'
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

function toHomebrewEquipment(doc: HomebrewDoc): Equipment {
  const record = doc as HomebrewEquipmentRecord
  const body = (record.body ?? {}) as Record<string, unknown>
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
    kind: record.kind as EquipmentKind,
    cost: record.cost as Equipment['cost'],
    ...body,
  } as Equipment
}

function kindSpecificBody(input: Record<string, unknown>): Record<string, unknown> {
  const {
    slug: _slug,
    name: _name,
    description: _description,
    imageKey: _imageKey,
    kind: _kind,
    cost: _cost,
    ...rest
  } = input
  return rest
}

function bodyFromCreateInput(input: Record<string, unknown>): Record<string, unknown> {
  const { slug: _slug, kind, name, description, imageKey, cost, ...rest } = input
  return {
    name,
    ...(description !== undefined && { description }),
    ...(imageKey !== undefined && { imageKey }),
    kind,
    cost,
    body: kindSpecificBody({ slug: _slug, kind, name, description, imageKey, cost, ...rest }),
  }
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
  prepareHomebrewUpdate: (doc, update) => {
    const mergedBody = deepMerge(
      (doc.body as Record<string, unknown>) ?? {},
      kindSpecificBody({ ...doc, ...update }),
    )
    const patch: Record<string, unknown> = {}
    if (update.slug !== undefined) patch.slug = update.slug
    if (update.name !== undefined) patch.name = update.name
    if (update.description !== undefined) patch.description = update.description
    if (update.imageKey !== undefined) patch.imageKey = update.imageKey
    if (update.kind !== undefined) patch.kind = update.kind
    if (update.cost !== undefined) patch.cost = update.cost
    patch.body = mergedBody
    return patch
  },
}
