import type { ReactNode } from 'react'

/** Inline field recommendation below the hint and above the control. */
export type FieldRecommendation = {
  content: ReactNode
  action: {
    label: string
    ariaLabel: string
    onClick: () => void
  }
}
