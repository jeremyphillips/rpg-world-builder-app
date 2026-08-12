import type { ReactElement } from 'react'

export type EntityItemTrailingAction = {
  kind: 'action'
  content: ReactElement
}

export type EntityItemTrailingIndicator =
  | { kind: 'indicator'; variant: 'chevron' }
  | { kind: 'indicator'; variant: 'quantity'; quantity: number; format?: 'compact' | 'label' }

export type EntityItemTrailingSecondary =
  | { kind: 'price'; label: string }
  | { kind: 'quantity'; quantity: number }
  | { kind: 'grantPreview'; label: string }

export type EntityItemTrailingGroup = {
  kind: 'group'
  primary: ReactElement
  secondary?: EntityItemTrailingSecondary
}

export type EntityItemTrailing =
  | EntityItemTrailingAction
  | EntityItemTrailingIndicator
  | EntityItemTrailingGroup
