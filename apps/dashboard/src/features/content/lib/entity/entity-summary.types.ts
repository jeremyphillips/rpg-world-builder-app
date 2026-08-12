import type { ReactNode } from 'react'

import type { EntitySummaryStatusItem } from './entity-summary-status.types'

/** Semantic entity identity data — navigation (`href`) belongs on surfaces, not the model. */
export type EntitySummaryModel = {
  heading: ReactNode
  classification?: ReactNode
  description?: ReactNode
  status?: readonly EntitySummaryStatusItem[]
  media?: ReactNode
}
