import type { Request, Response } from 'express'

import type { ResolvedSubclass, Subclass, SubclassCampaignAvailability } from '@rpg/contracts'
import { subclassCampaignAvailabilitySchema } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { findCampaignById } from '../../campaign'
import { resolveCatalog } from '../lib/resolve-catalog'
import { subclassContentConfig } from './subclasses.config'
import { SubclassCampaignAvailabilityModel } from './subclass-campaign-availability.model'

function attachActiveInCampaign(
  subclasses: readonly Subclass[],
  availabilityByTarget: Map<string, boolean>,
): ResolvedSubclass[] {
  return subclasses.map((subclass) => ({
    ...subclass,
    activeInCampaign: availabilityByTarget.get(subclass.id) ?? true,
  }))
}

/** Resolved subclasses for one class: system + patches + homebrew, with availability metadata. */
export async function resolveSubclassesForCampaign(
  campaignId: string,
  classId: string,
): Promise<ResolvedSubclass[]> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const { rulesetId } = campaign
  const [patches, homebrew, availabilityRows] = await Promise.all([
    subclassContentConfig.loadPatches(campaignId),
    subclassContentConfig.loadHomebrew(campaignId, rulesetId),
    SubclassCampaignAvailabilityModel.find({ campaignId }).lean<
      { targetId: string; activeInCampaign: boolean }[]
    >(),
  ])

  const resolved = resolveCatalog(
    subclassContentConfig.loadSystem(rulesetId),
    patches,
    homebrew,
  ).filter((subclass) => subclass.classId === classId)

  const availabilityByTarget = new Map(
    availabilityRows.map((row) => [row.targetId, row.activeInCampaign]),
  )

  return attachActiveInCampaign(resolved, availabilityByTarget)
}

export async function upsertSubclassCampaignAvailability(
  campaignId: string,
  subclassId: string,
  input: unknown,
): Promise<SubclassCampaignAvailability> {
  const parsed = subclassCampaignAvailabilitySchema.parse({
    ...(typeof input === 'object' && input !== null ? input : {}),
    campaignId,
    targetId: subclassId,
  })

  const doc = await SubclassCampaignAvailabilityModel.findOneAndUpdate(
    { campaignId, targetId: subclassId },
    { $set: { activeInCampaign: parsed.activeInCampaign } },
    { upsert: true, new: true, returnDocument: 'after' },
  ).lean<{ campaignId: string; targetId: string; activeInCampaign: boolean }>()

  if (!doc) {
    throw new HttpError(404, 'not_found', 'Subclass availability record not found after upsert.')
  }

  return subclassCampaignAvailabilitySchema.parse(doc)
}

export async function listSubclasses(req: Request, res: Response): Promise<void> {
  const { campaignId, classId } = req.params as { campaignId: string; classId: string }
  const subclasses = await resolveSubclassesForCampaign(campaignId, classId)
  res.status(200).json({ subclasses })
}
