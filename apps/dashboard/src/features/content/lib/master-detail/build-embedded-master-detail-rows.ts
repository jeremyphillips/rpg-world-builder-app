import type { AvailabilityReason } from '@/lib/availability'

import type { MasterDetailListItem } from '../../components/master-detail/master-detail-list-panel'
import type { ContentFormCtx } from '../forms/registry/content-form-registry'
import { resolveMasterDetailRowKey } from './content-campaign-availability'
import { buildEmbeddedMasterDetailListItem } from './build-embedded-master-detail-list-item'
import { buildMasterDetailAvailabilityPresentation } from './master-detail-availability.types'
import type { MasterDetailAvailabilityPresentation } from './master-detail-availability.types'
import type { MasterDetailItemNounTerm } from './master-detail-item-noun'
import { masterDetailItemTitle } from './master-detail-constants'

export type EmbeddedMasterDetailRow = {
  fieldId: string
  formIndex: number
  item: MasterDetailListItem
  availability: MasterDetailAvailabilityPresentation
}

export type BuildEmbeddedMasterDetailRowsParams = {
  fields: ReadonlyArray<{ id: string }>
  watched: readonly unknown[] | undefined
  formCtx: ContentFormCtx
  itemNoun: MasterDetailItemNounTerm
  showDelete: boolean
  availabilityFieldName: string
  mapListItem: (ctx: {
    field: { id: string }
    index: number
    row: unknown
    entitySource: ContentFormCtx['entitySource']
    hasRowError: (index: number) => boolean
  }) => Pick<MasterDetailListItem, 'title'> & { eyebrow?: string }
  hasRowError: (index: number) => boolean
  seedRowIds?: ReadonlySet<string>
  resolveRowReasons?: (ctx: {
    row: unknown
    rowKey: string
    index: number
  }) => readonly AvailabilityReason[]
}

function readRowAvailability(row: unknown, fieldName: string): boolean {
  if (typeof row !== 'object' || row === null) return true
  const value = (row as Record<string, unknown>)[fieldName]
  return value !== false
}

/** Single source of truth for form-embedded master-detail row projection. */
export function buildEmbeddedMasterDetailRows({
  fields,
  watched,
  formCtx,
  itemNoun,
  showDelete,
  availabilityFieldName,
  mapListItem,
  hasRowError,
  seedRowIds,
  resolveRowReasons,
}: BuildEmbeddedMasterDetailRowsParams): EmbeddedMasterDetailRow[] {
  return fields.map((field, formIndex) => {
    const row = watched?.[formIndex]
    const listDisplay = mapListItem({
      field,
      index: formIndex,
      row,
      entitySource: formCtx.entitySource,
      hasRowError,
    })
    const extraReasons =
      resolveRowReasons?.({
        row,
        rowKey: resolveMasterDetailRowKey(field.id, row as { id?: string } | undefined),
        index: formIndex,
      }) ?? []
    const listItem = buildEmbeddedMasterDetailListItem({
      field,
      index: formIndex,
      row: row as { id?: string } | undefined,
      entitySource: formCtx.entitySource,
      seedRowIds,
      hasRowError,
      title: masterDetailItemTitle(listDisplay.title, itemNoun),
      eyebrow: listDisplay.eyebrow,
      showDelete,
      extraReasons,
    })
    const isAvailable = readRowAvailability(row, availabilityFieldName)
    const availability = buildMasterDetailAvailabilityPresentation(field.id, isAvailable)

    return {
      fieldId: field.id,
      formIndex,
      item: {
        ...listItem,
        active: listItem.active !== false && isAvailable,
      },
      availability,
    }
  })
}

export function findEmbeddedMasterDetailRowByFieldId(
  rows: readonly EmbeddedMasterDetailRow[],
  fieldId: string | null,
): EmbeddedMasterDetailRow | undefined {
  if (!fieldId) return undefined
  return rows.find((row) => row.fieldId === fieldId)
}
