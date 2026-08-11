import type { ReactNode } from 'react'
import type { ResolvedArrayItemHeader } from '@rpg/ui/form'

import type { EntitySummaryModel } from './entity-summary.types'

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
  status?: readonly ReactNode[]
}): EntitySummaryModel {
  const heading = header.primary ?? header.fallback
  const resolvedClassification =
    classification && classification !== heading ? classification : undefined

  return {
    heading,
    ...(resolvedClassification ? { classification: resolvedClassification } : {}),
    ...(summary ? { description: summary } : {}),
    ...(status && status.length > 0 ? { status } : {}),
  }
}
