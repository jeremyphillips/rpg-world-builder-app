import type { ReactNode } from 'react'

export const CONTENT_STAT_ROW_INFO_PLACEMENTS = ['label', 'value'] as const

export type ContentStatRowInfoPlacement = (typeof CONTENT_STAT_ROW_INFO_PLACEMENTS)[number]

export type ContentStatRowData = {
  /** Stable row identity for surface-specific composition (e.g. equipment hero vs metadata). */
  id?: string
  label: string
  value: string
  /** When set, rendered instead of `value` in hero grids (`value` remains for summaries). */
  valueContent?: ReactNode
  /** Tooltip body for an info icon (rendered via `InfoTooltip`). */
  info?: string
  /** Where to show the info icon; defaults to `value` (game-term glossary). Use `label` for field concepts (e.g. boolean flags). */
  infoPlacement?: ContentStatRowInfoPlacement
  /** Accessible name for the info trigger; defaults to `About ${label}`. */
  infoAriaLabel?: string
}
