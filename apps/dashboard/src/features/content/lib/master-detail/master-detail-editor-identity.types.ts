import type { MasterDetailAvailabilityPresentation } from './master-detail-availability.types'
import type { MasterDetailItemMeta } from './master-detail-item-meta'
import type { MasterDetailInlineTitle } from './master-detail-inline-title.types'

export type MasterDetailEditorIdentity = {
  title: string
  /** Stable RHF field id; remounts the inline title editor when selection changes. */
  rowKey?: string
  /** When true, add acquisition is deferred to inline title (row hydration or initial edit). */
  acquisitionAwaitingTitleResolution?: boolean
  meta?: MasterDetailItemMeta
  /** Derived original name, shown in the detail caption while a custom name is stored. */
  sourceName?: string
  deletable?: boolean
  availability?: MasterDetailAvailabilityPresentation
  onAvailabilityChange?: () => void
  /** Distinct claim-target issue count for the selected row. */
  issueCount?: number
  /** Issues claimed by the row itself, shown beside the count. */
  headerIssues?: readonly { path: string; message: string }[]
  inlineTitle?: MasterDetailInlineTitle
}
