import type { Request, Response } from 'express'

import type { Subclass } from '@rpg/contracts'
import { loadSubclassesByClassId } from '@rpg/catalog/classes'

import { HttpError } from '../../../lib/http-error'
import { findCampaignById } from '../../campaign'

/** Catalog seed subclasses for one class in a campaign's pinned ruleset. */
export async function resolveSubclassesForCampaign(
  campaignId: string,
  classId: string,
): Promise<Subclass[]> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  return loadSubclassesByClassId(campaign.rulesetId, classId)
}

export async function listSubclasses(req: Request, res: Response): Promise<void> {
  const { campaignId, classId } = req.params as { campaignId: string; classId: string }
  const subclasses = await resolveSubclassesForCampaign(campaignId, classId)
  res.status(200).json({ subclasses })
}
