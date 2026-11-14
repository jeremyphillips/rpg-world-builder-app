import type { FieldRowAlignment } from '../../components/ui/field-control-band.variants'

import type { RowConfig, RowFieldItem, RowSpacing, SlotConfig } from './form-item.types'

export function isRowSlotItem(item: RowFieldItem): item is SlotConfig {
  return 'kind' in item && item.kind === 'slot'
}

/** Whether a row field reserves one line of derived metadata below its control. */
export function rowFieldReservesDerivedMeta(field: RowFieldItem): boolean {
  if (isRowSlotItem(field)) return false
  return Boolean(field.derivedMeta?.reserveSpace)
}

/**
 * Resolves row flex alignment. Rows with reserved derived metadata use top
 * alignment so sibling controls stay aligned while metadata extends below one field.
 */
export function resolveRowFieldAlign(item: Pick<RowConfig, 'align' | 'fields'>): FieldRowAlignment {
  if (item.align) return item.align
  return item.fields.some(rowFieldReservesDerivedMeta) ? 'start' : 'control-edge'
}

/** Maps row spacing config to {@link FieldRow} gap tokens. */
export function resolveRowFieldGap(spacing?: RowSpacing): 'form' | 'compact' {
  return spacing === 'compact' ? 'compact' : 'form'
}
