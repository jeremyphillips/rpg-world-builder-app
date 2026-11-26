import { resolveContentListForCampaign } from '../content.service'
import { filterOverlayFailuresForListViewer } from '../lib/filter-overlay-failures-for-list-viewer'
import type { CatalogListFilter } from '../lib/apply-catalog-list-filter'
import { loadSystemContent } from '../lib/content-type-config'
import { findCampaignById } from '../../campaign'
import { subclassContentConfig } from '../subclasses/subclasses.config'

/** Viewer-filtered subclass overlay failures grouped by parent class id (resolved-only summaries stay separate). */
export async function resolveSubclassOverlayFailureCountByClassId(
  campaignId: string,
  filter: CatalogListFilter | undefined,
): Promise<Map<string, number>> {
  const { overlayFailures } = await resolveContentListForCampaign(subclassContentConfig, campaignId)
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
