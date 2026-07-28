import {
  contentStatusToValidationIntent,
  type ContentSource,
  type ContentStatus,
  type ContentValidationIntent,
  type SystemRulesetId,
} from '@rpg/contracts'
import { ContentKeyError } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { findCampaignById } from '../../campaign'
import { resolveCatalogForCampaign } from '../content.service'
import { normalizeHomebrewWriteInput } from './apply-content-keys'
import { assertSlugAvailable } from './assert-slug-available'
import { deepMerge } from './deep-merge'
import type { ContentWriteConfig, ContentWriteContext, HomebrewDoc } from './content-write-config'
import { resolveStoredSchema, resolveWriteInputSchema } from './content-write-config'
import { stripNullDeep, stripNullDeepFields } from './strip-null-deep'
import type { ApiContentTypeKey } from '@rpg/contracts'
import type {
  ContentSlugCollisionPolicy,
  ResolvedContentSlug,
} from './slug/resolve-unique-content-slug'
import {
  asResolvedContentSlug,
  isSlugDuplicateKeyError,
  resolveNextSlugCandidate,
} from './slug/resolve-unique-content-slug'

const MAX_SLUG_ATTEMPTS = 5

export interface CreateHomebrewContentOptions {
  status?: ContentStatus
  source?: ContentSource
  slugCollisionPolicy?: ContentSlugCollisionPolicy
  resolvedSlug?: ResolvedContentSlug
  /** Skip nested id assignment — duplicate transform already regenerated authored ids. */
  preserveNestedIds?: boolean
}

type StoredEntity = {
  id: string
  slug: string
  source: ContentSource
  status: ContentStatus
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
    status: _status,
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
  mode: 'create' | 'update' | 'duplicate' = 'create',
): Record<string, unknown> {
  try {
    return normalizeHomebrewWriteInput(raw, existingBody, mode) as Record<string, unknown>
  } catch (err) {
    wrapContentKeyError(err)
  }
}

function prepareSystemPatchMerge<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  existing: T,
  existingPatch: Record<string, unknown> | undefined,
  update: Record<string, unknown>,
): { mergedBody: Record<string, unknown>; cumulativePatch: Record<string, unknown> } {
  const mergeOptions = { replaceKeys: config.readConfig.patchReplaceKeys }
  const patchBody = stripUndefined(update)
  const existingPatchStripped = existingPatch ?? {}
  const mergedBodyRaw = deepMerge(
    deepMerge(
      entityBody(existing as unknown as Record<string, unknown>),
      existingPatchStripped,
      mergeOptions,
    ),
    patchBody,
    mergeOptions,
  )
  return {
    mergedBody: mergedBodyRaw,
    cumulativePatch: deepMerge(existingPatchStripped, patchBody, mergeOptions),
  }
}

function parsePersistedWriteInput<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  normalized: Record<string, unknown>,
  mode: 'create' | 'update',
  validationIntent: ContentValidationIntent,
): Record<string, unknown> {
  const schema = resolveWriteInputSchema(config, mode, validationIntent)
  return schema.parse(normalized) as Record<string, unknown>
}

function buildWriteContext(
  campaignId: string,
  rulesetId: SystemRulesetId,
  mode: 'create' | 'update',
  validationIntent: ContentValidationIntent,
  input: Record<string, unknown>,
  normalized: Record<string, unknown>,
  existing?: StoredEntity,
): ContentWriteContext {
  return { campaignId, rulesetId, mode, validationIntent, input, normalized, existing }
}

async function runValidateBeforeWrite<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  ctx: ContentWriteContext,
): Promise<void> {
  if (ctx.validationIntent === 'draft') return
  await config.validateBeforeWrite?.(ctx)
}

async function finalizeWriteResult<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  ctx: ContentWriteContext,
  entity: T,
): Promise<T> {
  if (config.afterWrite) {
    return config.afterWrite({ ...ctx, entity }) as Promise<T>
  }
  return entity
}

function splitMongoUpdate(update: Record<string, unknown>): {
  set: Record<string, unknown>
  unset: Record<string, 1>
} {
  const set: Record<string, unknown> = {}
  const unset: Record<string, 1> = {}

  for (const [key, value] of Object.entries(update)) {
    if (value === null) unset[key] = 1
    else if (value !== undefined) set[key] = value
  }

  return { set, unset }
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

  const { set, unset } = splitMongoUpdate(patch)
  const mongoUpdate: { $set?: Record<string, unknown>; $unset?: Record<string, 1> } = {}
  if (Object.keys(set).length > 0) mongoUpdate.$set = set
  if (Object.keys(unset).length > 0) mongoUpdate.$unset = unset

  const updated = await config.homebrewModel
    .findOneAndUpdate({ _id: entityId, campaignId }, mongoUpdate, { returnDocument: 'after' })
    .lean<HomebrewDoc>()
  if (!updated) {
    throw new HttpError(404, 'not_found', 'Homebrew record not found.')
  }

  const entity = config.toHomebrewEntity(updated)
  const validationIntent = contentStatusToValidationIntent(
    (entity.status ?? 'published') as ContentStatus,
  )
  return resolveStoredSchema(config, validationIntent).parse(entity)
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
  const mergedBodyForParse = config.readConfig.patchReplaceKeys?.length
    ? stripNullDeepFields(mergedBody, config.readConfig.patchReplaceKeys)
    : mergedBody
  config.bodySchema.parse(mergedBodyForParse)

  const sanitizedPatch = stripNullDeep(cumulativePatch) as Record<string, unknown>

  await config.patchModel.findOneAndUpdate(
    { campaignId, targetId: entityId },
    { $set: { patch: sanitizedPatch } },
    { upsert: true, returnDocument: 'after' },
  )

  const resolved = await resolveCatalogForCampaign(config.readConfig, campaignId)
  const entity = resolved.find((record) => record.id === entityId)
  if (!entity) {
    throw new HttpError(404, 'not_found', 'Patched record not found after update.')
  }

  const sanitizeKeys = config.readConfig.patchReplaceKeys
  const entityForParse =
    sanitizeKeys?.length && entity
      ? stripNullDeepFields(entity as Record<string, unknown>, sanitizeKeys)
      : entity

  return config.storedSchema.parse(entityForParse as T)
}

/** Create a campaign-owned homebrew record for a content type. */
export async function createHomebrewContent<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  rawInput: unknown,
  options: CreateHomebrewContentOptions = {},
): Promise<T> {
  const status = options.status ?? 'published'
  const slugCollisionPolicy = options.slugCollisionPolicy ?? 'reject'
  const validationIntent = contentStatusToValidationIntent(status)
  const writeMode = options.preserveNestedIds ? 'duplicate' : 'create'
  const normalized = normalizeWriteInput(rawInput, undefined, writeMode)
  const input = parsePersistedWriteInput(config, normalized, 'create', validationIntent)
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const { rulesetId } = campaign
  const writeCtx = buildWriteContext(
    campaignId,
    rulesetId,
    'create',
    validationIntent,
    input,
    normalized,
  )
  await runValidateBeforeWrite(config, writeCtx)

  const requestedName = typeof input.name === 'string' ? input.name : ''
  const body = config.bodyFromCreateInput(input)

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
    const slug = await resolveSlugForCreateAttempt({
      attempt,
      resolvedSlug: options.resolvedSlug,
      slugCollisionPolicy,
      contentType: config.typeName as ApiContentTypeKey,
      campaignId,
      name: requestedName,
      rulesetId,
      config,
    })

    const slugCheckedInput = { ...input, slug }
    const writeCtxWithSlug = buildWriteContext(
      campaignId,
      rulesetId,
      'create',
      validationIntent,
      slugCheckedInput,
      { ...normalized, slug },
    )

    try {
      const created = await config.homebrewModel.create({
        campaignId,
        rulesetId,
        slug,
        status,
        ...body,
      })

      const entity = config.toHomebrewEntity(created.toObject() as unknown as HomebrewDoc)
      const parsed = resolveStoredSchema(config, validationIntent).parse(entity)
      return finalizeWriteResult(config, writeCtxWithSlug, parsed)
    } catch (error) {
      if (!isSlugDuplicateKeyError(error) || slugCollisionPolicy !== 'suffix') {
        throw error
      }
    }
  }

  throw new HttpError(409, 'slug_conflict', 'Could not allocate a unique slug for this content.')
}

async function resolveSlugForCreateAttempt<T extends StoredEntity>({
  attempt,
  resolvedSlug,
  slugCollisionPolicy,
  contentType,
  campaignId,
  name,
  rulesetId,
  config,
}: {
  attempt: number
  resolvedSlug?: ResolvedContentSlug
  slugCollisionPolicy: ContentSlugCollisionPolicy
  contentType: ApiContentTypeKey
  campaignId: string
  name: string
  rulesetId: SystemRulesetId
  config: ContentWriteConfig<T>
}): Promise<string> {
  if (attempt === 0 && resolvedSlug) {
    const campaignSlugs = await loadCampaignSlugs(config, campaignId, rulesetId)
    if (slugCollisionPolicy === 'reject') {
      assertSlugAvailable({
        slug: resolvedSlug,
        systemSlugs: config.readConfig.systemSlugs(rulesetId),
        campaignSlugs,
      })
    }
    return resolvedSlug
  }

  if (slugCollisionPolicy === 'suffix') {
    const next = await resolveNextSlugCandidate({ contentType, campaignId, name })
    return next
  }

  const slug = asResolvedContentSlug(deriveSlugFromInputName(name))
  const campaignSlugs = await loadCampaignSlugs(config, campaignId, rulesetId)
  assertSlugAvailable({
    slug,
    systemSlugs: config.readConfig.systemSlugs(rulesetId),
    campaignSlugs,
  })
  return slug
}

function deriveSlugFromInputName(name: string): string {
  const normalized = normalizeHomebrewWriteInput({ name }, undefined, 'create') as Record<
    string,
    unknown
  >
  const slug = normalized.slug
  if (typeof slug !== 'string') {
    throw new HttpError(400, 'bad_request', 'Create input must include a non-empty name.')
  }
  return slug
}

/** Resolve a catalog entity for write/delete guards — shared by update and deletion. */
export async function resolveContentEntityForWrite<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<{ campaign: NonNullable<Awaited<ReturnType<typeof findCampaignById>>>; entity: T }> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const catalog = await resolveCatalogForCampaign(config.readConfig, campaignId)
  const existing = catalog.find((record) => record.id === entityId)
  if (!existing) {
    throw new HttpError(404, 'not_found', 'Content record not found.')
  }

  if (existing.source === 'homebrew' && existing.campaignId !== campaignId) {
    throw new HttpError(403, 'forbidden', 'Cannot edit homebrew from another campaign.')
  }

  return { campaign, entity: existing }
}

/** Update a homebrew record or upsert a system overlay patch. */
export async function updateContentEntity<T extends StoredEntity>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
  rawInput: unknown,
): Promise<T> {
  const { campaign, entity: existing } = await resolveContentEntityForWrite(
    config,
    campaignId,
    entityId,
  )

  const existingBody = entityBody(existing as unknown as Record<string, unknown>)
  const normalized = normalizeWriteInput(rawInput, existingBody, 'update')
  const validationIntent = contentStatusToValidationIntent(existing.status)
  const update = parsePersistedWriteInput(config, normalized, 'update', validationIntent)
  const writeCtx = buildWriteContext(
    campaignId,
    campaign.rulesetId,
    'update',
    validationIntent,
    update,
    normalized,
    existing,
  )
  await runValidateBeforeWrite(config, writeCtx)

  if (existing.source === 'homebrew') {
    const updated = await updateHomebrewRecord(
      config,
      campaignId,
      campaign.rulesetId,
      entityId,
      existing,
      update,
    )
    return finalizeWriteResult(config, writeCtx, updated)
  }

  const patched = await updateSystemPatch(
    config,
    campaignId,
    campaign.rulesetId,
    entityId,
    existing,
    update,
  )
  return finalizeWriteResult(config, writeCtx, patched)
}
