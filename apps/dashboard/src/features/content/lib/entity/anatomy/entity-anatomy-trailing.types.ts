import type { ReactElement } from 'react'

/** Labeled commit control (Add, Select, Edit) — aligns with the heading band. */
export type EntityAnatomyTrailingAction = {
  kind: 'action'
  content: ReactElement
  /** Muted text rendered before the control in the same cell. */
  meta?: string
}

/** Ghost icon utility or utility cluster (remove, overflow, stepper) — centers on the row. */
export type EntityAnatomyTrailingUtility = {
  kind: 'utility'
  content: ReactElement
  /** Muted text rendered before the control in the same cell. */
  meta?: string
}

export type EntityAnatomyTrailingIndicator =
  | { kind: 'indicator'; variant: 'chevron'; meta?: string }
  | {
      kind: 'indicator'
      variant: 'quantity'
      quantity: number
      format?: 'compact' | 'label'
      /** Muted text rendered before the quantity label in the same cell. */
      meta?: string
    }
  | { kind: 'indicator'; variant: 'label'; label: string }

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
