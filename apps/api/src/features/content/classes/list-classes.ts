import type { Request, Response } from 'express'

import type { CharacterClass, ClassListItem } from '@rpg/contracts'
import { attachCampaignAccessForTargetType } from '../lib/content-campaign-access.service'
import { applyCatalogListFilter } from '../lib/apply-catalog-list-filter'
import { filterOverlayFailuresForListViewer } from '../lib/filter-overlay-failures-for-list-viewer'
import { resolveCatalogListFilter } from '../lib/resolve-catalog-membership-filter'
import { resolveContentListForCampaign } from '../content.service'
import { resolveClassesListForCampaign } from './derive-classes-catalog'
import { buildContentListUsageEnvelope } from '../lib/content-usage/build-content-list-usage-envelope'
import { contentUsageContextFromRequest } from '../lib/content-usage/content-usage-request-context'
import { resolveSubclassClassListSlice } from './resolve-subclass-class-list-slice'
import { subclassContentConfig } from '../subclasses/subclasses.config'

/** Classes list enriched with per-class subclass id+name summaries. */
export async function listClasses(req: Request, res: Response): Promise<void> {
  const { campaignId } = req.params as { campaignId: string }
  const catalogFilter = resolveCatalogListFilter(req)
  const { items, overlayFailures } = await resolveClassesListForCampaign(campaignId)
  const withCampaignAccess = await attachCampaignAccessForTargetType(campaignId, 'classes', items)
  const visibleClasses = applyCatalogListFilter(withCampaignAccess, catalogFilter)
  const visibleOverlayFailures = await filterOverlayFailuresForListViewer(
    campaignId,
    'classes',
    overlayFailures,
    catalogFilter,
  )
  const subclassCatalog = await resolveContentListForCampaign(subclassContentConfig, campaignId)
  const { summariesByClassId, failureCountByClassId } = await resolveSubclassClassListSlice(
    campaignId,
    catalogFilter,
    subclassCatalog,
  )

  const classes = (visibleClasses as unknown as CharacterClass[]).map((characterClass) => {
    const unresolvedSubclassOverlayCount = failureCountByClassId.get(characterClass.id)
    return {
      ...characterClass,
      subclasses: summariesByClassId.get(characterClass.id) ?? [],
      ...(unresolvedSubclassOverlayCount !== undefined && unresolvedSubclassOverlayCount > 0
        ? { unresolvedSubclassOverlayCount }
        : {}),
    }
  }) satisfies ClassListItem[]

  const usageEnvelope = await buildContentListUsageEnvelope(
    contentUsageContextFromRequest(req, campaignId),
    'classes',
    classes,
  )

  res.status(200).json({
    classes: usageEnvelope.items,
    ...(visibleOverlayFailures.length > 0 ? { overlayFailures: visibleOverlayFailures } : {}),
    ...(usageEnvelope.usageSummaryLabels
      ? { usageSummaryLabels: usageEnvelope.usageSummaryLabels }
      : {}),
    ...(usageEnvelope.overviewUsageScope
      ? { overviewUsageScope: usageEnvelope.overviewUsageScope }
      : {}),
  })
}
