import type { ResolvedContentCampaignAccess } from '@rpg/contracts'

import type { AvailabilityReason } from '@/lib/availability'

import type { MasterDetailListItem } from '../../components/master-detail/master-detail-list-panel'
import type { ContentFormCtx } from '../forms/registry/content-form-registry'
import { resolveMasterDetailRowKey } from './content-campaign-availability'
import { buildEmbeddedMasterDetailListItem } from './build-embedded-master-detail-list-item'
import { buildMasterDetailAvailabilityPresentation } from './master-detail-availability.types'
import type { MasterDetailAvailabilityPresentation } from './master-detail-availability.types'
import type { FormEmbeddedMasterDetailAccessConfig } from './master-detail-access.types'
import type { MasterDetailItemNounTerm } from './master-detail-item-noun'
import { masterDetailItemTitle } from './master-detail-constants'
import { readRowLocalCampaignAccess } from './master-detail-effective-access.lib'

export type EmbeddedMasterDetailRow = {
  fieldId: string
  formIndex: number
  item: MasterDetailListItem
  availability: MasterDetailAvailabilityPresentation
  localCampaignAccess?: ResolvedContentCampaignAccess
}

export type BuildEmbeddedMasterDetailRowsParams = {
  fields: ReadonlyArray<{ id: string }>
  watched: readonly unknown[] | undefined
  formCtx: ContentFormCtx
  itemNoun: MasterDetailItemNounTerm
  showDelete: boolean
  access: FormEmbeddedMasterDetailAccessConfig
  mapListItem: (ctx: {
    field: { id: string }
    index: number
    row: unknown
    entitySource: ContentFormCtx['entitySource']
    getRowIssueCount: (index: number) => number
  }) => Pick<MasterDetailListItem, 'title'> & { eyebrow?: string }
  getRowIssueCount: (index: number) => number
  seedRowIds?: ReadonlySet<string>
  resolveRowReasons?: (ctx: {
    row: unknown
    rowKey: string
    index: number
  }) => readonly AvailabilityReason[]
}

function readRowLocalAvailability(row: unknown, fieldName: string): boolean {
  if (typeof row !== 'object' || row === null) return true
  const value = (row as Record<string, unknown>)[fieldName]
  return value !== false
}

function resolveRowLocalAvailability(
  row: unknown,
  access: FormEmbeddedMasterDetailAccessConfig,
): { isAvailable: boolean; localCampaignAccess?: ResolvedContentCampaignAccess } {
  if (access.kind === 'availability') {
    return { isAvailable: readRowLocalAvailability(row, access.fieldName) }
  }

  const localCampaignAccess = readRowLocalCampaignAccess(row, access.fieldName)
  return {
    isAvailable: localCampaignAccess.available,
    localCampaignAccess,
  }
}

/** Single source of truth for form-embedded master-detail row projection. */
export function buildEmbeddedMasterDetailRows({
  fields,
  watched,
  formCtx,
  itemNoun,
  showDelete,
  access,
  mapListItem,
  getRowIssueCount,
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
      getRowIssueCount,
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
      getRowIssueCount,
      title: masterDetailItemTitle(listDisplay.title, itemNoun),
      eyebrow: listDisplay.eyebrow,
      showDelete,
      extraReasons,
    })
    const { isAvailable, localCampaignAccess } = resolveRowLocalAvailability(row, access)
    const availability = buildMasterDetailAvailabilityPresentation(field.id, isAvailable)

    return {
      fieldId: field.id,
      formIndex,
      item: {
        ...listItem,
        active: listItem.active !== false && isAvailable,
        ...(isAvailable ? {} : { availabilityStatusLabel: 'Unavailable' as const }),
      },
      availability,
      localCampaignAccess,
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
