import { findCampaignById } from '../../../../campaign'
import type { ContentTypeConfig } from '../../content-type-config'
import { loadSystemContent } from '../../content-type-config'
import { resolveContentListForCampaign } from '../../../content.service'

type OverlayFailureSeedReferrer<T extends { id: string; slug: string; name: string }> = {
  row: T
  usedSeedBody: true
}

/**
 * Resolved catalog rows plus seed bodies for overlay failures — protects delete guards
 * when a stored overlay cannot be applied but seed rows still carry references.
 */
export async function resolveCatalogRowsWithOverlayFailureSeeds<
  T extends {
    id: string
    slug: string
    name: string
  },
>(
  config: ContentTypeConfig<T>,
  campaignId: string,
): Promise<{
  records: T[]
  overlayFailureSeeds: OverlayFailureSeedReferrer<T>[]
}> {
  const { items, overlayFailures } = await resolveContentListForCampaign(config, campaignId)
  if (overlayFailures.length === 0) {
    return { records: items, overlayFailureSeeds: [] }
  }

  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    return { records: items, overlayFailureSeeds: [] }
  }

  const seedById = new Map(
    loadSystemContent(config, campaign.rulesetId).map((row) => [row.id, row] as const),
  )

  const overlayFailureSeeds: OverlayFailureSeedReferrer<T>[] = []
  for (const failure of overlayFailures) {
    const seed = seedById.get(failure.targetId)
    if (seed) {
      overlayFailureSeeds.push({ row: seed, usedSeedBody: true })
    }
  }

  return { records: items, overlayFailureSeeds }
}

export function mergeOverlayFailureSeedRows<T extends { id: string; slug: string; name: string }>(
  records: readonly T[],
  overlayFailureSeeds: readonly OverlayFailureSeedReferrer<T>[],
): T[] {
  const existingIds = new Set(records.map((row) => row.id))
  const appended = overlayFailureSeeds
    .map((entry) => entry.row)
    .filter((row) => !existingIds.has(row.id))
  return appended.length === 0 ? [...records] : [...records, ...appended]
}
