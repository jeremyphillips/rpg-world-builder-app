import { loadSeedVocabularyOptionSet, listSeedVocabularySetIds } from '@rpg/catalog/vocabulary'
import type {
  CreateVocabularyCampaignEntryInput,
  ResolvedVocabularyOptionSet,
  SystemRulesetId,
  UpdateVocabularyEntryInput,
  VocabularyDeleteAvailability,
  VocabularyDisableAvailability,
  VocabularyDisableAvailabilityBatchResponse,
  VocabularyDisableAvailabilityBatchTargetOutcome,
  VocabularyEntryUsage,
  VocabularyOptionSetId,
  VocabularyOptionSetPatch,
} from '@rpg/contracts'
import { getVocabularySetCapability, vocabularyEntryUsageSchema } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import {
  mapBatchTargetError,
  mapBatchTargetsWithConcurrency,
} from '../../../lib/action-batch-validate'
import { assertBatchResponseMatchesRequest } from '../../../lib/assert-batch-response-correspondence'
import { assertVocabularyIdAvailable } from '../lib/assert-vocabulary-id-available'
import { CampaignRulesetPatchModel } from '../lib/campaign-ruleset-patch.model'
import {
  getOrCreatePatchDocument,
  loadPatchDocument,
  requireCampaignRuleset,
  type PatchDocument,
} from '../lib/patch-document'
import { resolveVocabularySet } from '../lib/resolve-vocabulary'
import { buildVocabularyEntryUsageFromBlockers } from '../lib/map-vocabulary-usage-references'
import {
  resolveVocabularyOptionUsage,
  resolveVocabularyOptionUsageBatch,
  type VocabularyUsageResolverContext,
} from '../lib/vocabulary-usage-resolvers'
import { getVocabularyUsageRegistration } from '../lib/vocabulary-usage-registrations'
import {
  buildVocabularyUsageResolverContext,
  withAuthoritativeGuardPurpose,
} from '../lib/vocabulary-usage-context'

function assertSeedSetAvailable(rulesetId: SystemRulesetId, setId: VocabularyOptionSetId): void {
  if (!listSeedVocabularySetIds(rulesetId).includes(setId)) {
    throw new HttpError(
      404,
      'not_found',
      `Vocabulary set "${setId}" is not available for ruleset "${rulesetId}".`,
    )
  }
}

function getSetPatch(
  patchDoc: PatchDocument,
  setId: VocabularyOptionSetId,
): VocabularyOptionSetPatch {
  const vocabulary = (patchDoc.vocabulary ?? []) as VocabularyOptionSetPatch[]
  const existing = vocabulary.find((entry) => entry.setId === setId)
  if (existing) {
    return existing
  }
  return { setId }
}

function reservedVocabularyOptionIds(
  options: ReturnType<typeof resolveVocabularySet>,
): ReadonlySet<string> {
  return new Set(options.map((option) => option.id))
}

export async function countVocabularyOptionUsage(
  ctx: VocabularyUsageResolverContext,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<number> {
  const capability = getVocabularySetCapability(setId)
  if (!capability.usageResolution) {
    return 0
  }

  const { count } = await resolveVocabularyOptionUsage(ctx, setId, entryId)
  return count
}

async function resolveVocabularyDisableBlockers(
  ctx: VocabularyUsageResolverContext,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<VocabularyDisableAvailability> {
  const capability = getVocabularySetCapability(setId)
  if (!capability.disableGuard) {
    return { status: 'allowed' }
  }

  const { blockers } = await resolveVocabularyOptionUsage(
    withAuthoritativeGuardPurpose(ctx),
    setId,
    entryId,
  )
  if (blockers.length > 0) {
    return { status: 'blocked', blockers }
  }

  return { status: 'allowed' }
}

async function resolveVocabularyDeleteBlockers(
  ctx: VocabularyUsageResolverContext,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<VocabularyDeleteAvailability> {
  const capability = getVocabularySetCapability(setId)
  if (!capability.deleteGuard) {
    return { status: 'allowed' }
  }

  const { blockers } = await resolveVocabularyOptionUsage(
    withAuthoritativeGuardPurpose(ctx),
    setId,
    entryId,
  )
  if (blockers.length > 0) {
    return { status: 'blocked', blockers }
  }

  return { status: 'allowed' }
}

async function attachUsageCounts(
  ctx: VocabularyUsageResolverContext,
  setId: VocabularyOptionSetId,
  options: ReturnType<typeof resolveVocabularySet>,
): Promise<ResolvedVocabularyOptionSet['options']> {
  const capability = getVocabularySetCapability(setId)

  if (!capability.usageResolution) {
    return options.map((option) => ({ ...option, usedBy: 0 }))
  }

  if (capability.batchUsageCounting) {
    const batchResults = await resolveVocabularyOptionUsageBatch(
      ctx,
      setId,
      options.map((option) => option.id),
    )

    return options.map((option) => {
      const result = batchResults.get(option.id) ?? { count: 0, summaryReferences: [] }

      return {
        ...option,
        usedBy: result.count,
        ...(result.summaryReferences.length > 0 ? { usedBySummary: result.summaryReferences } : {}),
      }
    })
  }

  return Promise.all(
    options.map(async (option) => ({
      ...option,
      usedBy: await countVocabularyOptionUsage(ctx, setId, option.id),
    })),
  )
}

export async function resolveVocabularySetForCampaign(
  ctx: VocabularyUsageResolverContext,
  setId: VocabularyOptionSetId,
): Promise<ResolvedVocabularyOptionSet> {
  const { campaignId } = ctx
  const { rulesetId } = await requireCampaignRuleset(campaignId)
  assertSeedSetAvailable(rulesetId, setId)

  const seed = loadSeedVocabularyOptionSet(rulesetId, setId)
  const patchDoc = await loadPatchDocument(campaignId, rulesetId)
  const setPatch = patchDoc ? getSetPatch(patchDoc, setId) : undefined
  const capability = getVocabularySetCapability(setId)
  const options = resolveVocabularySet(seed, setPatch)
  const usageRegistration = capability.batchUsageCounting
    ? getVocabularyUsageRegistration(setId)
    : undefined

  return {
    id: setId,
    options: await attachUsageCounts(ctx, setId, options),
    ...(usageRegistration
      ? {
          usageSummaryLabels: usageRegistration.summaryLabels,
          overviewUsageScope: usageRegistration.overviewUsageScope,
        }
      : {}),
  }
}

export function vocabularyUsageContextForCampaign(
  campaignId: string,
): VocabularyUsageResolverContext {
  return buildVocabularyUsageResolverContext({ campaignId })
}

export async function listResolvedVocabularySetsForCampaign(
  ctx: VocabularyUsageResolverContext,
): Promise<ResolvedVocabularyOptionSet[]> {
  const { campaignId } = ctx
  const { rulesetId } = await requireCampaignRuleset(campaignId)
  const setIds = listSeedVocabularySetIds(rulesetId)
  return Promise.all(setIds.map((setId) => resolveVocabularySetForCampaign(ctx, setId)))
}

async function saveSetPatch(
  campaignId: string,
  rulesetId: SystemRulesetId,
  setPatch: VocabularyOptionSetPatch,
): Promise<void> {
  const doc = await CampaignRulesetPatchModel.findOne({ campaignId, rulesetId }).lean()
  const vocabulary: VocabularyOptionSetPatch[] = [
    ...((doc?.vocabulary ?? []) as VocabularyOptionSetPatch[]),
  ]
  const index = vocabulary.findIndex((entry) => entry.setId === setPatch.setId)

  if (index === -1) {
    vocabulary.push(setPatch)
  } else {
    vocabulary[index] = setPatch
  }

  await CampaignRulesetPatchModel.findOneAndUpdate(
    { campaignId, rulesetId },
    { $set: { vocabulary } },
    { upsert: true },
  )
}

export async function createCampaignVocabularyEntry(
  ctx: VocabularyUsageResolverContext,
  input: CreateVocabularyCampaignEntryInput,
): Promise<ResolvedVocabularyOptionSet> {
  const { campaignId } = ctx
  const { rulesetId } = await requireCampaignRuleset(campaignId)
  assertSeedSetAvailable(rulesetId, input.setId)

  const current = await resolveVocabularySetForCampaign(ctx, input.setId)

  assertVocabularyIdAvailable({
    id: input.id,
    reservedIds: reservedVocabularyOptionIds(current.options),
  })

  const patchDoc = await getOrCreatePatchDocument(campaignId, rulesetId)
  const setPatch = getSetPatch(patchDoc, input.setId)

  const campaignEntries = [...(setPatch.campaignEntries ?? [])]
  campaignEntries.push({
    id: input.id,
    label: input.label,
    description: input.description,
    status: input.status ?? 'active',
  })

  const removedCampaignEntryIds = (setPatch.removedCampaignEntryIds ?? []).filter(
    (id) => id !== input.id,
  )

  await saveSetPatch(campaignId, rulesetId, {
    ...setPatch,
    campaignEntries,
    removedCampaignEntryIds,
  })

  return resolveVocabularySetForCampaign(ctx, input.setId)
}

function findResolvedOption(
  set: ResolvedVocabularyOptionSet,
  entryId: string,
): ResolvedVocabularyOptionSet['options'][number] {
  const option = set.options.find((entry) => entry.id === entryId)
  if (!option) {
    throw new HttpError(404, 'not_found', `Vocabulary entry "${entryId}" not found.`)
  }
  return option
}

function applyVocabularyEntryInput<T extends { id: string }>(
  existing: T,
  input: UpdateVocabularyEntryInput,
): T {
  return {
    ...existing,
    ...(input.label !== undefined && { label: input.label }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.status !== undefined && { status: input.status }),
  }
}

function upsertSystemEntryPatch(
  setPatch: VocabularyOptionSetPatch,
  entryId: string,
  input: UpdateVocabularyEntryInput,
): VocabularyOptionSetPatch {
  const patches = setPatch.systemEntryPatches ?? []
  const index = patches.findIndex((patch) => patch.id === entryId)
  const next = applyVocabularyEntryInput(index >= 0 ? patches[index]! : { id: entryId }, input)
  const systemEntryPatches =
    index === -1 ? [...patches, next] : patches.map((patch, i) => (i === index ? next : patch))

  return { ...setPatch, systemEntryPatches }
}

function patchCampaignEntry(
  setPatch: VocabularyOptionSetPatch,
  entryId: string,
  input: UpdateVocabularyEntryInput,
): VocabularyOptionSetPatch {
  const campaignEntries = setPatch.campaignEntries ?? []
  const index = campaignEntries.findIndex((entry) => entry.id === entryId)
  if (index === -1) {
    throw new HttpError(404, 'not_found', `Campaign vocabulary entry "${entryId}" not found.`)
  }

  return {
    ...setPatch,
    campaignEntries: campaignEntries.map((entry, i) =>
      i === index ? applyVocabularyEntryInput(entry, input) : entry,
    ),
  }
}

function patchVocabularyEntry(
  setPatch: VocabularyOptionSetPatch,
  existing: ResolvedVocabularyOptionSet['options'][number],
  entryId: string,
  input: UpdateVocabularyEntryInput,
): VocabularyOptionSetPatch {
  return existing.source === 'system'
    ? upsertSystemEntryPatch(setPatch, entryId, input)
    : patchCampaignEntry(setPatch, entryId, input)
}

async function assertVocabularyEntryPatchAllowed(
  _setId: VocabularyOptionSetId,
  input: UpdateVocabularyEntryInput,
): Promise<void> {
  const hasLabelOrDescription = input.label !== undefined || input.description !== undefined
  const hasStatus = input.status !== undefined

  if (!hasLabelOrDescription && !hasStatus) {
    throw new HttpError(400, 'bad_request', 'No supported vocabulary patch fields were provided.')
  }
}

export async function getVocabularyDisableAvailability(
  ctx: VocabularyUsageResolverContext,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<VocabularyDisableAvailability> {
  if (!getVocabularySetCapability(setId).disableGuard) {
    throw new HttpError(
      404,
      'not_found',
      `Disable preflight is not available for vocabulary set "${setId}".`,
    )
  }

  const current = await resolveVocabularySetForCampaign(ctx, setId)
  findResolvedOption(current, entryId)

  return resolveVocabularyDisableBlockers(ctx, setId, entryId)
}

async function evaluateVocabularyDisableBatchTarget(
  ctx: VocabularyUsageResolverContext,
  set: ResolvedVocabularyOptionSet,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<VocabularyDisableAvailabilityBatchTargetOutcome> {
  const option = set.options.find((entry) => entry.id === entryId)
  if (!option) {
    return mapBatchTargetError(
      new HttpError(404, 'not_found', `Vocabulary entry "${entryId}" not found.`),
      entryId,
      entryId,
    )
  }

  try {
    const availability = await resolveVocabularyDisableBlockers(ctx, setId, entryId)
    return { targetId: entryId, targetName: option.label, availability }
  } catch (err) {
    console.error('batch vocabulary disable availability failed', {
      campaignId: ctx.campaignId,
      setId,
      entryId,
      err,
    })
    return mapBatchTargetError(err, entryId, option.label)
  }
}

export async function batchGetVocabularyDisableAvailability(
  ctx: VocabularyUsageResolverContext,
  setId: VocabularyOptionSetId,
  entryIds: readonly string[],
): Promise<VocabularyDisableAvailabilityBatchResponse> {
  const current = await resolveVocabularySetForCampaign(ctx, setId)

  if (!getVocabularySetCapability(setId).disableGuard) {
    const targets = entryIds.map((entryId) => {
      const option = current.options.find((entry) => entry.id === entryId)
      if (!option) {
        return mapBatchTargetError(
          new HttpError(404, 'not_found', `Vocabulary entry "${entryId}" not found.`),
          entryId,
          entryId,
        )
      }

      return {
        targetId: entryId,
        targetName: option.label,
        availability: { status: 'allowed' as const },
      }
    })

    const response = { targets }
    assertBatchResponseMatchesRequest(entryIds, response)
    return response
  }

  const targets = await mapBatchTargetsWithConcurrency({
    targets: entryIds,
    evaluateTarget: (entryId) => evaluateVocabularyDisableBatchTarget(ctx, current, setId, entryId),
  })

  const response = { targets }
  assertBatchResponseMatchesRequest(entryIds, response)
  return response
}

export async function getVocabularyEntryUsage(
  ctx: VocabularyUsageResolverContext,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<VocabularyEntryUsage> {
  if (!getVocabularySetCapability(setId).usageResolution) {
    throw new HttpError(
      404,
      'not_found',
      `Usage details are not available for vocabulary set "${setId}".`,
    )
  }

  const current = await resolveVocabularySetForCampaign(ctx, setId)
  findResolvedOption(current, entryId)

  const { blockers } = await resolveVocabularyOptionUsage(ctx, setId, entryId)
  return vocabularyEntryUsageSchema.parse(buildVocabularyEntryUsageFromBlockers(blockers))
}

export async function getVocabularyDeleteAvailability(
  ctx: VocabularyUsageResolverContext,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<VocabularyDeleteAvailability> {
  if (!getVocabularySetCapability(setId).deleteGuard) {
    throw new HttpError(
      404,
      'not_found',
      `Delete preflight is not available for vocabulary set "${setId}".`,
    )
  }

  const current = await resolveVocabularySetForCampaign(ctx, setId)
  const existing = findResolvedOption(current, entryId)

  if (existing.source === 'system') {
    throw new HttpError(
      403,
      'forbidden',
      'System vocabulary entries cannot be deleted. Disable them instead.',
    )
  }

  return resolveVocabularyDeleteBlockers(ctx, setId, entryId)
}

export async function updateVocabularyEntry(
  ctx: VocabularyUsageResolverContext,
  setId: VocabularyOptionSetId,
  entryId: string,
  input: UpdateVocabularyEntryInput,
): Promise<ResolvedVocabularyOptionSet> {
  const { campaignId } = ctx
  await assertVocabularyEntryPatchAllowed(setId, input)

  const { rulesetId } = await requireCampaignRuleset(campaignId)
  assertSeedSetAvailable(rulesetId, setId)

  const current = await resolveVocabularySetForCampaign(ctx, setId)
  const existing = findResolvedOption(current, entryId)

  if (input.status === 'disabled' && existing.status === 'active') {
    const disableCheck = await resolveVocabularyDisableBlockers(ctx, setId, entryId)
    if (disableCheck.status === 'blocked') {
      throw new HttpError(
        409,
        'in_use',
        `Vocabulary entry "${entryId}" is referenced and cannot be disabled.`,
        { blockers: disableCheck.blockers },
      )
    }
  }

  const patchDoc = await getOrCreatePatchDocument(campaignId, rulesetId)
  const setPatch = getSetPatch(patchDoc, setId)

  await saveSetPatch(
    campaignId,
    rulesetId,
    patchVocabularyEntry(setPatch, existing, entryId, input),
  )

  return resolveVocabularySetForCampaign(ctx, setId)
}

export async function deleteCampaignVocabularyEntry(
  ctx: VocabularyUsageResolverContext,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<ResolvedVocabularyOptionSet> {
  const { campaignId } = ctx
  const { rulesetId } = await requireCampaignRuleset(campaignId)
  assertSeedSetAvailable(rulesetId, setId)

  const current = await resolveVocabularySetForCampaign(ctx, setId)
  const existing = findResolvedOption(current, entryId)

  if (existing.source === 'system') {
    throw new HttpError(
      403,
      'forbidden',
      'System vocabulary entries cannot be deleted. Disable them instead.',
    )
  }

  const capability = getVocabularySetCapability(setId)
  if (capability.deleteGuard) {
    const deleteCheck = await resolveVocabularyDeleteBlockers(ctx, setId, entryId)
    if (deleteCheck.status === 'blocked') {
      throw new HttpError(
        409,
        'in_use',
        `Vocabulary entry "${entryId}" is referenced by ${deleteCheck.blockers.length} record(s) and cannot be deleted.`,
        { blockers: deleteCheck.blockers },
      )
    }
  }

  const patchDoc = await getOrCreatePatchDocument(campaignId, rulesetId)
  const setPatch = getSetPatch(patchDoc, setId)

  const campaignEntries = (setPatch.campaignEntries ?? []).filter((entry) => entry.id !== entryId)
  const removedCampaignEntryIds = [
    ...new Set([...(setPatch.removedCampaignEntryIds ?? []), entryId]),
  ]

  await saveSetPatch(campaignId, rulesetId, {
    ...setPatch,
    campaignEntries,
    removedCampaignEntryIds,
  })

  return resolveVocabularySetForCampaign(ctx, setId)
}
