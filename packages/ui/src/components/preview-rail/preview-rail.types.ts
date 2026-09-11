import type { ReactNode } from 'react'

import type { AlertVariant } from '../ui/alert'
import type { SemanticTextTone } from '../ui/semantic-text/semantic-text.variants'
import type { StatusIconVariant } from '../ui/status-icon.variants'

export type PreviewRailSectionMarker = StatusIconVariant

export type PreviewRailStatusTone = SemanticTextTone

export type PreviewRailFact = {
  label: string
  value: ReactNode
}

export type PreviewRailAvailability = {
  available: boolean
  statusLabel: string
  detail?: string
}

export type PreviewRailStatusPanelVariant = Extract<AlertVariant, 'default' | 'success' | 'warning'>

export type PreviewRailChrome = 'card' | 'plain'
