import type { CatalogOverlayListFailure, ContentSummaryRef, ResolvedSubclass } from '@rpg/contracts'

import { findCampaignById } from '../../campaign'
import { resolveContentListForCampaign } from '../content.service'
import { attachCampaignAccessForTargetType } from '../lib/content-campaign-access.service'
import { applyCatalogListFilter } from '../lib/apply-catalog-list-filter'
import type { CatalogListFilter } from '../lib/apply-catalog-list-filter'
import { filterOverlayFailuresForListViewer } from '../lib/filter-overlay-failures-for-list-viewer'
import { loadSystemContent } from '../lib/content-type-config'
import { subclassContentConfig } from '../subclasses/subclasses.config'

export type SubclassClassListSlice = {
  summariesByClassId: Map<string, ContentSummaryRef[]>
  failureCountByClassId: Map<string, number>
}

/**
 * One subclass catalog resolution for `GET …/classes`: resolved-only summaries plus
 * viewer-filtered unresolved counts grouped by parent class id.
 */
export async function resolveSubclassClassListSlice(
  campaignId: string,
  filter: CatalogListFilter | undefined,
): Promise<SubclassClassListSlice> {
  const { items, overlayFailures } = await resolveContentListForCampaign(
    subclassContentConfig,
    campaignId,
  )

  const withCampaignAccess = await attachCampaignAccessForTargetType(
    campaignId,
    'subclasses',
    items as ResolvedSubclass[],
  )
  const visible = applyCatalogListFilter(withCampaignAccess, filter)

  const summariesByClassId = new Map<string, ContentSummaryRef[]>()
  for (const subclass of visible) {
    const summaries = summariesByClassId.get(subclass.classId) ?? []
    summaries.push({ id: subclass.id, name: subclass.name })
    summariesByClassId.set(subclass.classId, summaries)
  }

  const failureCountByClassId = await overlayFailureCountsForParents(
    campaignId,
    filter,
    overlayFailures,
  )

  return { summariesByClassId, failureCountByClassId }
}

async function overlayFailureCountsForParents(
  campaignId: string,
  filter: CatalogListFilter | undefined,
  overlayFailures: readonly CatalogOverlayListFailure[],
): Promise<Map<string, number>> {
  const visibleFailures = await filterOverlayFailuresForListViewer(
    campaignId,
    'subclasses',
    overlayFailures,
    filter,
  )
  if (visibleFailures.length === 0) return new Map()

  const campaign = await findCampaignById(campaignId)
  if (!campaign) return new Map()

  const classIdBySubclassSeedId = new Map(
    loadSystemContent(subclassContentConfig, campaign.rulesetId).map((row) => [
      row.id,
      row.classId,
    ]),
  )

  const counts = new Map<string, number>()
  for (const failure of visibleFailures) {
    const classId = classIdBySubclassSeedId.get(failure.targetId)
    if (!classId) continue
    counts.set(classId, (counts.get(classId) ?? 0) + 1)
  }
  return counts
}
