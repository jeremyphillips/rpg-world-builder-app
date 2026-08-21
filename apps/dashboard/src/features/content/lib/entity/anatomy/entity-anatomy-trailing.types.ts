import type { ReactElement } from 'react'

export type EntityAnatomyTrailingAction = {
  kind: 'action'
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
  | EntityAnatomyTrailingIndicator
  | EntityAnatomyTrailingGroup
