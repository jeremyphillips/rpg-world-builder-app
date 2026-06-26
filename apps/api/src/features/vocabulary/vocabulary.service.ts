import {
  loadSeedVocabularyOptionSet,
  listSeedVocabularySetIds,
  seedVocabularyOptionIds,
} from '@rpg/catalog/vocabulary'
import type {
  CreateVocabularyCampaignEntryInput,
  ResolvedVocabularyOptionSet,
  SystemRulesetId,
  UpdateVocabularyEntryInput,
  VocabularyOptionSetId,
  VocabularyOptionSetPatch,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { findCampaignById } from '../campaign'
import { assertVocabularyIdAvailable } from './assert-vocabulary-id-available'
import {
  CampaignRulesetPatchModel,
  type CampaignRulesetPatchSchemaType,
} from './campaign-ruleset-patch.model'
import { resolveVocabularySet } from './resolve-vocabulary'

type PatchDocument = CampaignRulesetPatchSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

async function requireCampaignRuleset(campaignId: string): Promise<{
  rulesetId: SystemRulesetId
}> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }
  return { rulesetId: campaign.rulesetId }
}

function assertSeedSetAvailable(rulesetId: SystemRulesetId, setId: VocabularyOptionSetId): void {
  if (!listSeedVocabularySetIds(rulesetId).includes(setId)) {
    throw new HttpError(
      404,
      'not_found',
      `Vocabulary set "${setId}" is not available for ruleset "${rulesetId}".`,
    )
  }
}

async function loadPatchDocument(
  campaignId: string,
  rulesetId: SystemRulesetId,
): Promise<PatchDocument | null> {
  return CampaignRulesetPatchModel.findOne({ campaignId, rulesetId }).lean()
}

async function getOrCreatePatchDocument(
  campaignId: string,
  rulesetId: SystemRulesetId,
): Promise<PatchDocument> {
  const existing = await CampaignRulesetPatchModel.findOne({ campaignId, rulesetId })
  if (existing) {
    return existing.toObject() as PatchDocument
  }

  const created = await CampaignRulesetPatchModel.create({ campaignId, rulesetId, vocabulary: [] })
  return created.toObject() as PatchDocument
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

function campaignEntryIds(setPatch: VocabularyOptionSetPatch): ReadonlySet<string> {
  const removed = new Set(setPatch.removedCampaignEntryIds ?? [])
  return new Set(
    (setPatch.campaignEntries ?? [])
      .filter((entry) => !removed.has(entry.id))
      .map((entry) => entry.id),
  )
}

/**
 * Usage count stub — always returns 0 until species/settings reference tracking
 * is wired for delete/disable validation.
 */
export async function countVocabularyOptionUsage(
  _campaignId: string,
  _setId: VocabularyOptionSetId,
  _entryId: string,
): Promise<number> {
  return 0
}

function attachUsageCounts(
  campaignId: string,
  setId: VocabularyOptionSetId,
  options: ReturnType<typeof resolveVocabularySet>,
): Promise<ResolvedVocabularyOptionSet['options']> {
  return Promise.all(
    options.map(async (option) => ({
      ...option,
      usedBy: await countVocabularyOptionUsage(campaignId, setId, option.id),
    })),
  )
}

export async function resolveVocabularySetForCampaign(
  campaignId: string,
  setId: VocabularyOptionSetId,
): Promise<ResolvedVocabularyOptionSet> {
  const { rulesetId } = await requireCampaignRuleset(campaignId)
  assertSeedSetAvailable(rulesetId, setId)

  const seed = loadSeedVocabularyOptionSet(rulesetId, setId)
  const patchDoc = await loadPatchDocument(campaignId, rulesetId)
  const setPatch = patchDoc ? getSetPatch(patchDoc, setId) : undefined
  const options = resolveVocabularySet(seed, setPatch)

  return {
    id: setId,
    options: await attachUsageCounts(campaignId, setId, options),
  }
}

export async function listResolvedVocabularySetsForCampaign(
  campaignId: string,
): Promise<ResolvedVocabularyOptionSet[]> {
  const { rulesetId } = await requireCampaignRuleset(campaignId)
  const setIds = listSeedVocabularySetIds(rulesetId)
  return Promise.all(setIds.map((setId) => resolveVocabularySetForCampaign(campaignId, setId)))
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
  campaignId: string,
  input: CreateVocabularyCampaignEntryInput,
): Promise<ResolvedVocabularyOptionSet> {
  const { rulesetId } = await requireCampaignRuleset(campaignId)
  assertSeedSetAvailable(rulesetId, input.setId)

  const patchDoc = await getOrCreatePatchDocument(campaignId, rulesetId)
  const setPatch = getSetPatch(patchDoc, input.setId)

  assertVocabularyIdAvailable({
    id: input.id,
    systemIds: seedVocabularyOptionIds(rulesetId, input.setId),
    campaignIds: campaignEntryIds(setPatch),
  })

  const campaignEntries = [...(setPatch.campaignEntries ?? [])]
  campaignEntries.push({
    id: input.id,
    label: input.label,
    description: input.description,
    status: 'active',
  })

  const removedCampaignEntryIds = (setPatch.removedCampaignEntryIds ?? []).filter(
    (id) => id !== input.id,
  )

  await saveSetPatch(campaignId, rulesetId, {
    ...setPatch,
    campaignEntries,
    removedCampaignEntryIds,
  })

  return resolveVocabularySetForCampaign(campaignId, input.setId)
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

export async function updateVocabularyEntry(
  campaignId: string,
  setId: VocabularyOptionSetId,
  entryId: string,
  input: UpdateVocabularyEntryInput,
): Promise<ResolvedVocabularyOptionSet> {
  const { rulesetId } = await requireCampaignRuleset(campaignId)
  assertSeedSetAvailable(rulesetId, setId)

  const current = await resolveVocabularySetForCampaign(campaignId, setId)
  const existing = findResolvedOption(current, entryId)
  const patchDoc = await getOrCreatePatchDocument(campaignId, rulesetId)
  const setPatch = getSetPatch(patchDoc, setId)

  await saveSetPatch(
    campaignId,
    rulesetId,
    patchVocabularyEntry(setPatch, existing, entryId, input),
  )

  return resolveVocabularySetForCampaign(campaignId, setId)
}

export async function deleteCampaignVocabularyEntry(
  campaignId: string,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<ResolvedVocabularyOptionSet> {
  const { rulesetId } = await requireCampaignRuleset(campaignId)
  assertSeedSetAvailable(rulesetId, setId)

  const current = await resolveVocabularySetForCampaign(campaignId, setId)
  const existing = findResolvedOption(current, entryId)

  if (existing.source === 'system') {
    throw new HttpError(
      403,
      'forbidden',
      'System vocabulary entries cannot be deleted. Disable them instead.',
    )
  }

  const usedBy = await countVocabularyOptionUsage(campaignId, setId, entryId)
  if (usedBy > 0) {
    throw new HttpError(
      409,
      'in_use',
      `Vocabulary entry "${entryId}" is referenced by ${usedBy} record(s) and cannot be deleted.`,
    )
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

  return resolveVocabularySetForCampaign(campaignId, setId)
}
