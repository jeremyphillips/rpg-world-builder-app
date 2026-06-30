import type { Request, Response } from 'express'

import {
  createVocabularyCampaignEntryInputSchema,
  updateVocabularyEntryInputSchema,
  vocabularyOptionSetIdSchema,
} from '@rpg/contracts'
import type {
  CreateVocabularyCampaignEntryInput,
  UpdateVocabularyEntryInput,
  VocabularyOptionSetId,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import {
  createCampaignVocabularyEntry,
  deleteCampaignVocabularyEntry,
  listResolvedVocabularySetsForCampaign,
  resolveVocabularySetForCampaign,
  updateVocabularyEntry,
} from './vocabulary.service'

function parseSetId(raw: string): VocabularyOptionSetId {
  const parsed = vocabularyOptionSetIdSchema.safeParse(raw)
  if (!parsed.success) {
    throw new HttpError(404, 'not_found', `Unknown vocabulary set "${raw}".`)
  }
  return parsed.data
}

export async function listVocabularySets(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const sets = await listResolvedVocabularySetsForCampaign(campaignId)
  res.status(200).json({ sets })
}

export async function getVocabularySet(req: Request, res: Response): Promise<void> {
  const { campaignId, setId: rawSetId } = req.params as { campaignId: string; setId: string }
  const set = await resolveVocabularySetForCampaign(campaignId, parseSetId(rawSetId))
  res.status(200).json({ set })
}

export async function createVocabularyEntry(req: Request, res: Response): Promise<void> {
  const { campaignId, setId: rawSetId } = req.params as { campaignId: string; setId: string }
  const setId = parseSetId(rawSetId)
  const parsed = createVocabularyCampaignEntryInputSchema.safeParse({
    ...(req.body as CreateVocabularyCampaignEntryInput),
    setId,
  })
  if (!parsed.success) {
    throw HttpError.badRequest('Invalid vocabulary entry payload.', parsed.error.flatten())
  }

  const set = await createCampaignVocabularyEntry(campaignId, parsed.data)
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
  const parsed = updateVocabularyEntryInputSchema.safeParse(req.body as UpdateVocabularyEntryInput)
  if (!parsed.success) {
    throw HttpError.badRequest('Invalid vocabulary entry patch.', parsed.error.flatten())
  }

  const set = await updateVocabularyEntry(campaignId, parseSetId(rawSetId), entryId, parsed.data)
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
  const set = await deleteCampaignVocabularyEntry(campaignId, parseSetId(rawSetId), entryId)
  res.status(200).json({ set })
}
