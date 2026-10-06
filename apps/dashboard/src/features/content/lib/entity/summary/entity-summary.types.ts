import type { ReactNode } from 'react'

import type { EntitySummaryProvenanceItem } from './entity-summary-provenance.types'
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
  /** Ownership segments rendered ahead of status on the same line. Never status items. */
  provenance?: readonly EntitySummaryProvenanceItem[]
  /** Defaults to `cluster`. */
  statusComposition?: EntitySummaryStatusComposition
  media?: ReactNode
}
