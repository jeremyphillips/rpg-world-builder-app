import type { ReactNode } from 'react'

import type {
  EntitySummaryStatusComposition,
  EntitySummaryStatusItem,
} from './entity-summary-status.types'

/** Semantic entity identity data — navigation (`href`) belongs on surfaces, not the model. */
export type EntitySummaryModel = {
  heading: ReactNode
  classification?: ReactNode
  description?: ReactNode
  status?: readonly EntitySummaryStatusItem[]
  /** Defaults to `cluster`. */
  statusComposition?: EntitySummaryStatusComposition
  media?: ReactNode
}
