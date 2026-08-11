import type { ReactNode } from 'react'

import type { EntitySummaryModel } from './entity-summary.types'

export type EntitySummaryProjectionInput = {
  heading: ReactNode
  /** Inline classification after the heading — may include a leading ` · ` separator. */
  classification?: ReactNode
  description?: ReactNode
  status?: ReactNode
}

/** Maps detail/relationship row props onto the shared entity summary vocabulary. */
export function projectEntitySummaryModel({
  heading,
  classification,
  description,
  status,
}: EntitySummaryProjectionInput): EntitySummaryModel {
  return {
    heading,
    ...(classification != null && classification !== '' ? { classification } : {}),
    ...(description != null && description !== '' ? { description } : {}),
    ...(status != null && status !== '' ? { status: [status] } : {}),
  }
}
