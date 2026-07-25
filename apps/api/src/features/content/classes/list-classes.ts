import type { Request, Response } from 'express'

import type { CharacterClass, ClassListItem, ContentSummaryRef } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { findCampaignById } from '../../campaign'
import { attachCampaignAccessForTargetType } from '../lib/content-campaign-access.service'
import { filterCatalogForMembership } from '../lib/filter-catalog-for-viewer'
import { resolveCatalog } from '../lib/resolve-catalog'
import { resolveContentForCampaign } from '../content-types'
import { subclassContentConfig } from '../subclasses/subclasses.config'

/** Membership-filtered subclass summaries grouped by parent class id. */
export async function resolveSubclassSummariesByClassId(
  campaignId: string,
  membership: Parameters<typeof filterCatalogForMembership>[1],
): Promise<Map<string, ContentSummaryRef[]>> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const { rulesetId } = campaign
  const [patches, homebrew] = await Promise.all([
    subclassContentConfig.loadPatches(campaignId),
    subclassContentConfig.loadHomebrew(campaignId, rulesetId),
  ])

  const resolved = resolveCatalog(subclassContentConfig.loadSystem(rulesetId), patches, homebrew)
  const withCampaignAccess = await attachCampaignAccessForTargetType(
    campaignId,
    'subclasses',
    resolved,
  )
  const visible = filterCatalogForMembership(withCampaignAccess, membership)

  const byClassId = new Map<string, ContentSummaryRef[]>()
  for (const subclass of visible) {
    const summaries = byClassId.get(subclass.classId) ?? []
    summaries.push({ id: subclass.id, name: subclass.name })
    byClassId.set(subclass.classId, summaries)
  }

  return byClassId
}

/** Classes list enriched with per-class subclass id+name summaries. */
export async function listClasses(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const items = await resolveContentForCampaign('classes', campaignId)
  const withCampaignAccess = await attachCampaignAccessForTargetType(campaignId, 'classes', items)
  const visibleClasses = filterCatalogForMembership(withCampaignAccess, req.campaignMembership)
  const subclassSummaries = await resolveSubclassSummariesByClassId(
    campaignId,
    req.campaignMembership,
  )

  const classes = (visibleClasses as unknown as CharacterClass[]).map((characterClass) => ({
    ...characterClass,
    subclasses: subclassSummaries.get(characterClass.id) ?? [],
  })) satisfies ClassListItem[]

  res.status(200).json({ classes })
}
