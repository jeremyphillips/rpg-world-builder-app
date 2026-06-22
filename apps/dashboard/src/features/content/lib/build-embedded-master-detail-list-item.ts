import type { ContentFormCtx } from './content-form-registry'
import { isEmbeddedRowSystemLocked } from './is-embedded-row-system-locked'
import type { MasterDetailListItem } from '../components/master-detail-list-panel.client'

const SYSTEM_ROW_BADGE = { label: 'System', variant: 'secondary' as const }

export interface BuildEmbeddedMasterDetailListItemParams {
  field: { id: string }
  index: number
  row: { id?: string } | undefined
  entitySource: ContentFormCtx['entitySource']
  hasRowError: (index: number) => boolean
  title: string
  eyebrow?: string
}

/** Builds a list row with derived system-lock badge and deletable flag. */
export function buildEmbeddedMasterDetailListItem({
  field,
  index,
  row,
  entitySource,
  hasRowError,
  title,
  eyebrow,
}: BuildEmbeddedMasterDetailListItemParams): MasterDetailListItem {
  const locked = isEmbeddedRowSystemLocked(row, entitySource)
  return {
    id: field.id,
    title,
    ...(eyebrow !== undefined ? { eyebrow } : {}),
    deletable: !locked,
    hasError: hasRowError(index),
    ...(locked ? { badge: SYSTEM_ROW_BADGE } : {}),
  }
}
