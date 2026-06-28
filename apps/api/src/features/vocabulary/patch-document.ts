import type { SystemRulesetId } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { findCampaignById } from '../campaign'
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
