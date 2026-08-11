import type { ReactNode } from 'react'

/** Semantic entity identity data — navigation (`href`) belongs on surfaces, not the model. */
export type EntitySummaryModel = {
  heading: ReactNode
  classification?: ReactNode
  description?: ReactNode
  status?: readonly ReactNode[]
  media?: ReactNode
}
