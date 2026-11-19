import type { MasterDetailItemMeta } from './master-detail-item-meta'

export type MasterDetailListItem = {
  /** Stable domain row id (`resolveMasterDetailRowKey`), or the resource id. */
  id: string
  /** Display label for the row. */
  title: string
  /** Structured subtitle parts for list row content and detail identity. */
  meta?: MasterDetailItemMeta
  /** Unique presentation-path issue count for the row; badge omitted when zero. */
  issueCount?: number
  /** When true, surfaces a validation error indicator on the row. */
  hasError?: boolean
  /** When false, detail overflow hides delete. Not shown on list rows. */
  deletable?: boolean
  /** Broad campaign availability label rendered below the title when unavailable. */
  availabilityStatusLabel?: 'Unavailable'
}
