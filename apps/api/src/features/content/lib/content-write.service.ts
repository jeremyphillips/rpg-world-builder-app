import type { ClassStored, ContentSource } from '@rpg/contracts'
import { ContentKeyError, stripClassSkillFromFromInput } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { findCampaignById } from '../../campaign/find-campaign-by-id'
import { assertCreatureTypesActiveInCampaign } from '../../vocabulary/assert-campaign-creature-types'
import { enrichClassWithDerivedSkills } from '../classes/derive-classes-catalog'
import { classContentConfig } from '../classes/classes.config'
import { resolveCatalogForCampaign } from '../content.service'
import { assertSpellClassIdsHaveSpellcasting } from '../spells/assert-spell-class-ids'
import { normalizeHomebrewWriteInput } from './apply-content-keys'
import { assertSlugAvailable } from './assert-slug-available'
import { deepMerge } from './deep-merge'
import type { ContentWriteConfig, HomebrewDoc } from './content-write-config'
import {
  extractSkillsFromFromUpdate,
  syncSuggestedClassesFromClass,
} from './sync-suggested-classes-from-class'

type StoredEntity = {
  id: string
  slug: string
  source: ContentSource
  campaignId: string | null
}

function stripUndefined(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined))
}

function entityBody(entity: Record<string, unknown>): Record<string, unknown> {
  const {
    id: _id,
    slug: _slug,
    rulesetId: _rulesetId,
    source: _source,
    campaignId: _campaignId,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...body
  } = entity
  return body
}

async function loadCampaignSlugs<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  rulesetId: Parameters<ContentWriteConfig<T>['readConfig']['loadHomebrew']>[1],
): Promise<Set<string>> {
  const homebrew = await config.readConfig.loadHomebrew(campaignId, rulesetId)
  return new Set(homebrew.map((record) => record.slug))
}

function wrapContentKeyError(err: unknown): never {
  if (err instanceof ContentKeyError) {
    throw new HttpError(400, 'stable_id_conflict', err.message)
  }
  throw err
}

function normalizeWriteInput(
  raw: unknown,
  existingBody?: Record<string, unknown>,
  mode: 'create' | 'update' = 'create',
): Record<string, unknown> {
  try {
    return normalizeHomebrewWriteInput(raw, existingBody, mode) as Record<string, unknown>
  } catch (err) {
    wrapContentKeyError(err)
  }
}

function stripPersistedClassPatch<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  input: Record<string, unknown>,
): Record<string, unknown> {
  return config.typeName === 'classes' ? stripClassSkillFromFromInput(input) : input
}

function prepareSystemPatchMerge<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  existing: T,
  existingPatch: Record<string, unknown> | undefined,
  update: Record<string, unknown>,
): { mergedBody: Record<string, unknown>; cumulativePatch: Record<string, unknown> } {
  const patchBody = stripUndefined(stripPersistedClassPatch(config, stripUndefined(update)))
  const existingPatchStripped = stripPersistedClassPatch(config, existingPatch ?? {})
  const mergedBodyRaw = deepMerge(
    deepMerge(entityBody(existing as unknown as Record<string, unknown>), existingPatchStripped),
    patchBody,
  )
  return {
    mergedBody: stripPersistedClassPatch(config, mergedBodyRaw),
    cumulativePatch: deepMerge(existingPatchStripped, patchBody),
  }
}

function parsePersistedWriteInput<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  normalized: Record<string, unknown>,
  mode: 'create' | 'update',
): Record<string, unknown> {
  const forParse = stripPersistedClassPatch(config, normalized)
  const schema = mode === 'create' ? config.createInputSchema : config.updateInputSchema
  return schema.parse(forParse) as Record<string, unknown>
}

async function finalizeWriteResult<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  stored: T,
): Promise<T> {
  if (config.typeName !== 'classes') return stored
  return (await enrichClassWithDerivedSkills(
    campaignId,
    stored as unknown as ClassStored,
  )) as unknown as T
}

async function updateHomebrewRecord<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  _rulesetId: Parameters<ContentWriteConfig<T>['readConfig']['loadHomebrew']>[1],
  entityId: string,
  _existing: T,
  update: Record<string, unknown>,
): Promise<T> {
  const doc = await config.homebrewModel.findOne({ _id: entityId, campaignId }).lean<HomebrewDoc>()
  if (!doc) {
    throw new HttpError(404, 'not_found', 'Homebrew record not found.')
  }

  delete update.slug

  const patch = config.prepareHomebrewUpdate
    ? config.prepareHomebrewUpdate(doc, update)
    : stripUndefined(update)

  const updated = await config.homebrewModel
    .findOneAndUpdate({ _id: entityId, campaignId }, { $set: patch }, { new: true })
    .lean<HomebrewDoc>()
  if (!updated) {
    throw new HttpError(404, 'not_found', 'Homebrew record not found.')
  }

  const entity = config.toHomebrewEntity(updated)
  return config.storedSchema.parse(entity)
}

async function updateSystemPatch<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  _rulesetId: Parameters<ContentWriteConfig<T>['readConfig']['systemSlugs']>[0],
  entityId: string,
  existing: T,
  update: Record<string, unknown>,
): Promise<T> {
  if (!config.patchModel) {
    throw new HttpError(400, 'not_patchable', 'This content type does not support system patches.')
  }

  const existingPatchDoc = await config.patchModel
    .findOne({ campaignId, targetId: entityId })
    .lean<{ patch: Record<string, unknown> }>()

  const { mergedBody, cumulativePatch } = prepareSystemPatchMerge(
    config,
    existing,
    existingPatchDoc?.patch,
    update,
  )
  config.bodySchema.parse(mergedBody)

  await config.patchModel.findOneAndUpdate(
    { campaignId, targetId: entityId },
    { $set: { patch: cumulativePatch } },
    { upsert: true, new: true },
  )

  const resolved = await resolveCatalogForCampaign(config.readConfig, campaignId)
  const entity = resolved.find((record) => record.id === entityId)
  if (!entity) {
    throw new HttpError(404, 'not_found', 'Patched record not found after update.')
  }
  return config.storedSchema.parse(entity)
}

async function syncClassSkillEdgesIfNeeded<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  classSlug: string,
  rawInput: Record<string, unknown>,
): Promise<void> {
  if (config.typeName !== 'classes') return
  const nextSkillSlugs = extractSkillsFromFromUpdate(rawInput)
  if (!nextSkillSlugs) return
  await syncSuggestedClassesFromClass(campaignId, classSlug, nextSkillSlugs)
}

async function assertSpellClassIdsForCampaign<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  classIds: string[],
): Promise<void> {
  if (config.typeName !== 'spells') return
  const classes = await resolveCatalogForCampaign(classContentConfig, campaignId)
  assertSpellClassIdsHaveSpellcasting(classIds, classes)
}

async function assertSpeciesCreatureTypeForCampaign<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  input: Record<string, unknown>,
): Promise<void> {
  if (config.typeName !== 'species') return
  const creatureType = input.creatureType
  if (typeof creatureType !== 'string') return
  await assertCreatureTypesActiveInCampaign(campaignId, [creatureType])
}

/** Create a campaign-owned homebrew record for a content type. */
export async function createHomebrewContent<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  rawInput: unknown,
): Promise<T> {
  const normalized = normalizeWriteInput(rawInput, undefined, 'create')
  const input = parsePersistedWriteInput(config, normalized, 'create')
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const { rulesetId } = campaign
  const slug = input.slug as string
  await assertSpellClassIdsForCampaign(config, campaignId, input.classIds as string[])
  await assertSpeciesCreatureTypeForCampaign(config, campaignId, input)
  const campaignSlugs = await loadCampaignSlugs(config, campaignId, rulesetId)
  assertSlugAvailable({
    slug,
    systemSlugs: config.readConfig.systemSlugs(rulesetId),
    campaignSlugs,
  })

  const body = config.bodyFromCreateInput(input)
  const created = await config.homebrewModel.create({
    campaignId,
    rulesetId,
    slug,
    ...body,
  })

  const entity = config.toHomebrewEntity(created.toObject() as unknown as HomebrewDoc)
  const parsed = config.storedSchema.parse(entity)
  await syncClassSkillEdgesIfNeeded(config, campaignId, parsed.slug, normalized)
  return finalizeWriteResult(config, campaignId, parsed)
}

/** Update a homebrew record or upsert a system overlay patch. */
export async function updateContentEntity<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
  rawInput: unknown,
): Promise<T> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const catalog = await resolveCatalogForCampaign(config.readConfig, campaignId)
  const existing = catalog.find((record) => record.id === entityId)
  if (!existing) {
    throw new HttpError(404, 'not_found', 'Content record not found.')
  }

  const existingBody = entityBody(existing as unknown as Record<string, unknown>)
  const normalized = normalizeWriteInput(rawInput, existingBody, 'update')
  await syncClassSkillEdgesIfNeeded(config, campaignId, existing.slug, normalized)
  const update = parsePersistedWriteInput(config, normalized, 'update')
  if (config.typeName === 'spells') {
    const effectiveClassIds = (update.classIds ??
      (existing as unknown as { classIds: string[] }).classIds) as string[]
    await assertSpellClassIdsForCampaign(config, campaignId, effectiveClassIds)
  }
  await assertSpeciesCreatureTypeForCampaign(config, campaignId, update)

  if (existing.source === 'homebrew') {
    if (existing.campaignId !== campaignId) {
      throw new HttpError(403, 'forbidden', 'Cannot edit homebrew from another campaign.')
    }
    const updated = await updateHomebrewRecord(
      config,
      campaignId,
      campaign.rulesetId,
      entityId,
      existing,
      update,
    )
    return finalizeWriteResult(config, campaignId, updated)
  }

  const patched = await updateSystemPatch(
    config,
    campaignId,
    campaign.rulesetId,
    entityId,
    existing,
    update,
  )
  return finalizeWriteResult(config, campaignId, patched)
}
