import type { ReactElement } from 'react'

/** Labeled commit control (Add, Select, Edit) — aligns with the heading band. */
export type EntityAnatomyTrailingAction = {
  kind: 'action'
  content: ReactElement
}

/** Ghost icon utility or utility cluster (remove, overflow, stepper) — centers on the row. */
export type EntityAnatomyTrailingUtility = {
  kind: 'utility'
  content: ReactElement
}

export type EntityAnatomyTrailingIndicator =
  | { kind: 'indicator'; variant: 'chevron' }
  | { kind: 'indicator'; variant: 'quantity'; quantity: number; format?: 'compact' | 'label' }

export type EntityAnatomyTrailingSecondary =
  | { kind: 'price'; label: string }
  | { kind: 'quantity'; quantity: number }
  | { kind: 'grantPreview'; label: string }

export type EntityAnatomyTrailingGroup = {
  kind: 'group'
  primary: ReactElement
  secondary?: EntityAnatomyTrailingSecondary
}

export type EntityAnatomyTrailing =
  | EntityAnatomyTrailingAction
  | EntityAnatomyTrailingUtility
  | EntityAnatomyTrailingIndicator
  | EntityAnatomyTrailingGroup
