import type { Request, Response } from 'express'

import type { CharacterClass, ClassListItem, ContentSummaryRef } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { findCampaignById } from '../../campaign'
import { attachCampaignAccessForTargetType } from '../lib/content-campaign-access.service'
import { filterCatalogForMembership } from '../lib/filter-catalog-for-viewer'
import { resolveCatalogMembershipFilter } from '../lib/resolve-catalog-membership-filter'
import { resolveCatalog } from '../lib/resolve-catalog'
import { loadSystemContent, loadSystemContentPatches } from '../lib/content-type-config'
import { resolveContentForCampaign } from '../content-types'
import { buildContentListUsageEnvelope } from '../lib/content-usage/build-content-list-usage-envelope'
import { contentUsageContextFromRequest } from '../lib/content-usage/content-usage-request-context'
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
    loadSystemContentPatches(subclassContentConfig, campaignId),
    subclassContentConfig.loadHomebrew(campaignId, rulesetId),
  ])

  const resolved = resolveCatalog(
    loadSystemContent(subclassContentConfig, rulesetId),
    patches,
    homebrew,
  )
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
  const membershipFilter = resolveCatalogMembershipFilter(req)
  const items = await resolveContentForCampaign('classes', campaignId)
  const withCampaignAccess = await attachCampaignAccessForTargetType(campaignId, 'classes', items)
  const visibleClasses = filterCatalogForMembership(withCampaignAccess, membershipFilter)
  const subclassSummaries = await resolveSubclassSummariesByClassId(campaignId, membershipFilter)

  const classes = (visibleClasses as unknown as CharacterClass[]).map((characterClass) => ({
    ...characterClass,
    subclasses: subclassSummaries.get(characterClass.id) ?? [],
  })) satisfies ClassListItem[]

  const usageEnvelope = await buildContentListUsageEnvelope(
    contentUsageContextFromRequest(req, campaignId),
    'classes',
    classes,
  )

  res.status(200).json({
    classes: usageEnvelope.items,
    ...(usageEnvelope.usageSummaryLabels
      ? { usageSummaryLabels: usageEnvelope.usageSummaryLabels }
      : {}),
    ...(usageEnvelope.overviewUsageScope
      ? { overviewUsageScope: usageEnvelope.overviewUsageScope }
      : {}),
  })
}
