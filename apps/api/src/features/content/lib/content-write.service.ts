import type { ContentSource } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { findCampaignById } from '../../campaign'
import { resolveCatalogForCampaign } from '../content.service'
import { assertSlugAvailable } from './assert-slug-available'
import { deepMerge } from './deep-merge'
import type { ContentWriteConfig, HomebrewDoc } from './content-write-config'

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

function assertSlugChangeAllowed<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  rulesetId: Parameters<ContentWriteConfig<T>['readConfig']['systemSlugs']>[0],
  campaignSlugs: Set<string>,
  nextSlug: string,
  currentSlug: string,
): void {
  if (nextSlug === currentSlug) return
  const otherSlugs = new Set([...campaignSlugs].filter((slug) => slug !== currentSlug))
  assertSlugAvailable({
    slug: nextSlug,
    systemSlugs: config.readConfig.systemSlugs(rulesetId),
    campaignSlugs: otherSlugs,
  })
}

async function updateHomebrewRecord<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  rulesetId: Parameters<ContentWriteConfig<T>['readConfig']['loadHomebrew']>[1],
  entityId: string,
  existing: T,
  update: Record<string, unknown>,
): Promise<T> {
  const doc = await config.homebrewModel.findOne({ _id: entityId, campaignId }).lean<HomebrewDoc>()
  if (!doc) {
    throw new HttpError(404, 'not_found', 'Homebrew record not found.')
  }

  const nextSlug = typeof update.slug === 'string' ? update.slug : existing.slug
  const campaignSlugs = await loadCampaignSlugs(config, campaignId, rulesetId)
  assertSlugChangeAllowed(config, rulesetId, campaignSlugs, nextSlug, existing.slug)

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

  const patchBody = stripUndefined(update)
  delete patchBody.slug

  const existingPatchDoc = await config.patchModel
    .findOne({ campaignId, targetId: entityId })
    .lean<{
      patch: Record<string, unknown>
    }>()

  const mergedBody = deepMerge(
    deepMerge(
      entityBody(existing as unknown as Record<string, unknown>),
      existingPatchDoc?.patch ?? {},
    ),
    patchBody,
  )
  config.bodySchema.parse(mergedBody)

  const cumulativePatch = deepMerge(existingPatchDoc?.patch ?? {}, patchBody)
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

/** Create a campaign-owned homebrew record for a content type. */
export async function createHomebrewContent<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  rawInput: unknown,
): Promise<T> {
  const input = config.createInputSchema.parse(rawInput) as Record<string, unknown>
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const { rulesetId } = campaign
  const campaignSlugs = await loadCampaignSlugs(config, campaignId, rulesetId)
  assertSlugAvailable({
    slug: input.slug as string,
    systemSlugs: config.readConfig.systemSlugs(rulesetId),
    campaignSlugs,
  })

  const body = config.bodyFromCreateInput(input)
  const created = await config.homebrewModel.create({
    campaignId,
    rulesetId,
    slug: input.slug,
    ...body,
  })

  const entity = config.toHomebrewEntity(created.toObject() as unknown as HomebrewDoc)
  return config.storedSchema.parse(entity)
}

/** Update a homebrew record or upsert a system overlay patch. */
export async function updateContentEntity<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
  rawInput: unknown,
): Promise<T> {
  const update = config.updateInputSchema.parse(rawInput) as Record<string, unknown>
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const catalog = await resolveCatalogForCampaign(config.readConfig, campaignId)
  const existing = catalog.find((record) => record.id === entityId)
  if (!existing) {
    throw new HttpError(404, 'not_found', 'Content record not found.')
  }

  if (existing.source === 'homebrew') {
    if (existing.campaignId !== campaignId) {
      throw new HttpError(403, 'forbidden', 'Cannot edit homebrew from another campaign.')
    }
    return updateHomebrewRecord(config, campaignId, campaign.rulesetId, entityId, existing, update)
  }

  return updateSystemPatch(config, campaignId, campaign.rulesetId, entityId, existing, update)
}
