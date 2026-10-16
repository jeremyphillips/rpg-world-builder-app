import type { ReactNode } from 'react'

/** Quick-add text action shared by field and collection recommendations. */
export type FieldRecommendationAction = {
  label: string
  ariaLabel: string
  onClick: () => void
}

/** Inline field recommendation below the hint and above the control. */
export type FieldRecommendation = {
  content: ReactNode
  action: FieldRecommendationAction
}

/** One actionable collection recommendation (label adjacent to its action). */
export type FieldRecommendationItem = {
  id: string
  label: string
  action: FieldRecommendationAction
}

/** Multiple recommendations above a collection list or empty state. */
export type FieldRecommendationGroup = {
  sourceLabel?: string
  items: readonly FieldRecommendationItem[]
}
