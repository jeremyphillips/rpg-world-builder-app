import type { Request, Response } from 'express'

import type { ResolvedSubclass } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { findCampaignById } from '../../campaign'
import { resolveCatalog } from '../lib/resolve-catalog'
import { attachCampaignAccessForTargetType } from '../lib/content-campaign-access.service'
import { subclassContentConfig } from './subclasses.config'

/** Resolved subclasses for one class: system + patches + homebrew, with campaign access metadata. */
export async function resolveSubclassesForCampaign(
  campaignId: string,
  classId: string,
): Promise<ResolvedSubclass[]> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const { rulesetId } = campaign
  const [patches, homebrew] = await Promise.all([
    subclassContentConfig.loadPatches(campaignId),
    subclassContentConfig.loadHomebrew(campaignId, rulesetId),
  ])

  const resolved = resolveCatalog(
    subclassContentConfig.loadSystem(rulesetId),
    patches,
    homebrew,
  ).filter((subclass) => subclass.classId === classId)

  return attachCampaignAccessForTargetType(campaignId, 'subclasses', resolved)
}

export async function listSubclasses(req: Request, res: Response): Promise<void> {
  const { campaignId, classId } = req.params as { campaignId: string; classId: string }
  const subclasses = await resolveSubclassesForCampaign(campaignId, classId)
  res.status(200).json({ subclasses })
}
