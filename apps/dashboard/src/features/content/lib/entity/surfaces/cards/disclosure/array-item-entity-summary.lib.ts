import type { ResolvedArrayItemHeader } from '@rpg/ui/form'

import type { EntitySummaryStatusItem } from '../../../summary/entity-summary-status.types'
import type { EntitySummaryModel } from '../../../summary/entity-summary.types'

function normalizeSummaryPart(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function isRedundantClassification(heading: string, classification: string): boolean {
  const normalizedHeading = normalizeSummaryPart(heading)
  const normalizedClassification = normalizeSummaryPart(classification)
  if (normalizedClassification === normalizedHeading) return true
  if (normalizedClassification.startsWith(`${normalizedHeading} —`)) return true
  if (normalizedClassification.startsWith(`${normalizedHeading} ·`)) return true
  const headingPrefix = new RegExp(
    `^${normalizedHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[,—·]`,
  )
  return headingPrefix.test(normalizedClassification)
}

/**
 * Projects form array header labels into EntitySummaryModel for entity-backed
 * array shells. Secondary copy uses `description`; validation chrome belongs in
 * `status` / trailing `action`, not grant-local header markup.
 */
export function projectArrayItemEntitySummary({
  header,
  summary,
  classification,
  status,
}: {
  header: ResolvedArrayItemHeader
  summary?: string
  classification?: string
  status?: readonly EntitySummaryStatusItem[]
}): EntitySummaryModel {
  const heading = header.primary ?? header.fallback
  const resolvedClassification =
    classification && !isRedundantClassification(heading, classification)
      ? classification
      : undefined

  return {
    heading,
    ...(resolvedClassification ? { classification: resolvedClassification } : {}),
    ...(summary ? { description: summary } : {}),
    ...(status && status.length > 0 ? { status } : {}),
  }
}
