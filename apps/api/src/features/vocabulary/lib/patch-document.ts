import type { SystemRulesetId } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { findCampaignById } from '../../campaign'
import {
  CampaignRulesetPatchModel,
  type CampaignRulesetPatchSchemaType,
} from './campaign-ruleset-patch.model'

export type PatchDocument = CampaignRulesetPatchSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

export async function requireCampaignRuleset(campaignId: string): Promise<{
  rulesetId: SystemRulesetId
}> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }
  return { rulesetId: campaign.rulesetId }
}

export async function loadPatchDocument(
  campaignId: string,
  rulesetId: SystemRulesetId,
): Promise<PatchDocument | null> {
  return CampaignRulesetPatchModel.findOne({ campaignId, rulesetId }).lean()
}

export async function getOrCreatePatchDocument(
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

export type SparsePatchUpdateOps = {
  $set: Record<string, unknown>
  $unset: Record<string, 1>
}

/** Applies sparse `$set` / `$unset` operations to a campaign ruleset patch document. */
export async function applySparsePatchUpdate(
  campaignId: string,
  rulesetId: SystemRulesetId,
  ops: SparsePatchUpdateOps,
): Promise<void> {
  await getOrCreatePatchDocument(campaignId, rulesetId)

  if (Object.keys(ops.$set).length === 0 && Object.keys(ops.$unset).length === 0) {
    return
  }

  const update: { $set?: Record<string, unknown>; $unset?: Record<string, 1> } = {}
  if (Object.keys(ops.$set).length > 0) update.$set = ops.$set
  if (Object.keys(ops.$unset).length > 0) update.$unset = ops.$unset

  await CampaignRulesetPatchModel.findOneAndUpdate({ campaignId, rulesetId }, update, {
    upsert: true,
  })
}
