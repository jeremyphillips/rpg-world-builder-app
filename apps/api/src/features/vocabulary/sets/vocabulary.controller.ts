import type { Request, Response } from 'express'

import {
  createVocabularyCampaignEntryRequestSchema,
  deriveVocabularyEntryId,
  updateVocabularyEntryInputSchema,
  vocabularyOptionSetIdSchema,
} from '@rpg/contracts'
import type {
  CreateVocabularyCampaignEntryInput,
  UpdateVocabularyEntryInput,
  VocabularyOptionSetId,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { assertVocabularySetCapability } from '../lib/assert-vocabulary-set-capability'
import {
  createCampaignVocabularyEntry,
  deleteCampaignVocabularyEntry,
  getVocabularyDeleteAvailability,
  getVocabularyDisableAvailability,
  batchGetVocabularyDisableAvailability,
  getVocabularyEntryUsage,
  listResolvedVocabularySetsForCampaign,
  resolveVocabularySetForCampaign,
  updateVocabularyEntry,
} from './vocabulary.service'
import { vocabularyUsageContextFromRequest } from './vocabulary-request-context'

function parseSetId(raw: string): VocabularyOptionSetId {
  const parsed = vocabularyOptionSetIdSchema.safeParse(raw)
  if (!parsed.success) {
    throw new HttpError(404, 'not_found', `Unknown vocabulary set "${raw}".`)
  }
  return parsed.data
}

export async function listVocabularySets(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const ctx = vocabularyUsageContextFromRequest(req, campaignId)
  const sets = await listResolvedVocabularySetsForCampaign(ctx)
  res.status(200).json({ sets })
}

export async function getVocabularySet(req: Request, res: Response): Promise<void> {
  const { campaignId, setId: rawSetId } = req.params as { campaignId: string; setId: string }
  const ctx = vocabularyUsageContextFromRequest(req, campaignId)
  const set = await resolveVocabularySetForCampaign(ctx, parseSetId(rawSetId))
  res.status(200).json({ set })
}

export async function createVocabularyEntry(req: Request, res: Response): Promise<void> {
  const { campaignId, setId: rawSetId } = req.params as { campaignId: string; setId: string }
  const setId = parseSetId(rawSetId)
  assertVocabularySetCapability(setId, 'create')

  const parsed = createVocabularyCampaignEntryRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    throw HttpError.badRequest('Invalid vocabulary entry payload.', parsed.error.flatten())
  }

  const canonicalId = deriveVocabularyEntryId(parsed.data.label)
  if (parsed.data.id !== undefined && parsed.data.id !== canonicalId) {
    throw new HttpError(
      400,
      'bad_request',
      `Client id "${parsed.data.id}" does not match canonical id "${canonicalId}" derived from label.`,
    )
  }

  const input: CreateVocabularyCampaignEntryInput = {
    setId,
    id: canonicalId,
    label: parsed.data.label,
    description: parsed.data.description,
    status: parsed.data.status,
  }

  if (input.status !== undefined) {
    assertVocabularySetCapability(setId, 'availability')
  }

  const ctx = vocabularyUsageContextFromRequest(req, campaignId)
  const set = await createCampaignVocabularyEntry(ctx, input)
  res.status(201).json({ set })
}

export async function patchVocabularyEntry(req: Request, res: Response): Promise<void> {
  const {
    campaignId,
    setId: rawSetId,
    entryId,
  } = req.params as {
    campaignId: string
    setId: string
    entryId: string
  }
  const setId = parseSetId(rawSetId)
  const parsed = updateVocabularyEntryInputSchema.safeParse(req.body as UpdateVocabularyEntryInput)
  if (!parsed.success) {
    throw HttpError.badRequest('Invalid vocabulary entry patch.', parsed.error.flatten())
  }

  const hasLabelOrDescription =
    parsed.data.label !== undefined || parsed.data.description !== undefined
  const hasStatus = parsed.data.status !== undefined
  if (hasLabelOrDescription) {
    assertVocabularySetCapability(setId, 'edit')
  }
  if (hasStatus) {
    assertVocabularySetCapability(setId, 'availability')
  }

  const ctx = vocabularyUsageContextFromRequest(req, campaignId)
  const set = await updateVocabularyEntry(ctx, setId, entryId, parsed.data)
  res.status(200).json({ set })
}

export async function removeVocabularyEntry(req: Request, res: Response): Promise<void> {
  const {
    campaignId,
    setId: rawSetId,
    entryId,
  } = req.params as {
    campaignId: string
    setId: string
    entryId: string
  }
  const setId = parseSetId(rawSetId)
  assertVocabularySetCapability(setId, 'delete')

  const ctx = vocabularyUsageContextFromRequest(req, campaignId)
  const set = await deleteCampaignVocabularyEntry(ctx, setId, entryId)
  res.status(200).json({ set })
}

export async function getVocabularyDisableAvailabilityHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const {
    campaignId,
    setId: rawSetId,
    entryId,
  } = req.params as {
    campaignId: string
    setId: string
    entryId: string
  }
  const setId = parseSetId(rawSetId)
  const ctx = vocabularyUsageContextFromRequest(req, campaignId)
  const availability = await getVocabularyDisableAvailability(ctx, setId, entryId)
  res.status(200).json({ availability })
}

export async function batchGetVocabularyDisableAvailabilityHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, setId: rawSetId } = req.params as { campaignId: string; setId: string }
  const setId = parseSetId(rawSetId)
  const { targets } = req.body as { targets: Array<{ entryId: string }> }
  const entryIds = targets.map((target) => target.entryId)

  const ctx = vocabularyUsageContextFromRequest(req, campaignId)
  const batch = await batchGetVocabularyDisableAvailability(ctx, setId, entryIds)
  res.status(200).json(batch)
}

export async function getVocabularyEntryUsageHandler(req: Request, res: Response): Promise<void> {
  const {
    campaignId,
    setId: rawSetId,
    entryId,
  } = req.params as {
    campaignId: string
    setId: string
    entryId: string
  }
  const setId = parseSetId(rawSetId)
  const ctx = vocabularyUsageContextFromRequest(req, campaignId)
  const usage = await getVocabularyEntryUsage(ctx, setId, entryId)
  res.status(200).json({ usage })
}

export async function getVocabularyDeleteAvailabilityHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const {
    campaignId,
    setId: rawSetId,
    entryId,
  } = req.params as {
    campaignId: string
    setId: string
    entryId: string
  }
  const setId = parseSetId(rawSetId)
  const ctx = vocabularyUsageContextFromRequest(req, campaignId)
  const availability = await getVocabularyDeleteAvailability(ctx, setId, entryId)
  res.status(200).json({ availability })
}
