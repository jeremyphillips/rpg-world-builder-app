import type {
  ContentInformationalUsageReference,
  ContentUsageBlocker,
  ContentUsageSummaryLabels,
} from '@rpg/contracts'
import { CONTENT_USAGE_SUMMARY_LIMIT } from '@rpg/contracts'

import { buildContentEntryUsageFromBlockers } from './map-content-usage-references'

export type ContentBatchUsageEntryResult = {
  count: number
  summaryReferences: ContentInformationalUsageReference[]
}

export function buildContentBatchUsageEntryResult(
  blockers: ContentUsageBlocker[],
): ContentBatchUsageEntryResult {
  const { references, usedBy } = buildContentEntryUsageFromBlockers(blockers)

  return {
    count: usedBy,
    summaryReferences: references.slice(0, CONTENT_USAGE_SUMMARY_LIMIT),
  }
}

export function buildContentBatchUsageResults(
  entryIds: readonly string[],
  blockersByEntryId: Map<string, ContentUsageBlocker[]>,
): Map<string, ContentBatchUsageEntryResult> {
  return new Map(
    entryIds.map((entryId) => [
      entryId,
      buildContentBatchUsageEntryResult(blockersByEntryId.get(entryId) ?? []),
    ]),
  )
}

export type { ContentUsageSummaryLabels }
