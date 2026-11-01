import { useCallback, useMemo, useRef } from 'react'
import { useWatch } from 'react-hook-form'
import type { FormItem } from '@rpg/ui/form'

import type { Availability, AvailabilityReason } from '@/lib/availability'
import { openCampaignAvailabilityDialog } from '../campaign-access/open-campaign-availability-dialog.lib'
import type { ContentFormCtx } from '../forms/registry/content-form-registry'
import { buildEmbeddedMasterDetailListItem } from './build-embedded-master-detail-list-item'
import {
  buildEmbeddedMasterDetailRows,
  findEmbeddedMasterDetailRowByFieldId,
  type EmbeddedMasterDetailRow,
} from './build-embedded-master-detail-rows'
import { resolveMasterDetailRowKey } from './content-campaign-availability'
import type { FormEmbeddedMasterDetailAccessConfig } from './master-detail-access.types'
import { buildMasterDetailAvailabilityFormFields } from './master-detail-availability-form-fields'
import { useMasterDetailRowValidation } from './master-detail-row-validation'
import type { MasterDetailItemNounTerm } from './master-detail-item-noun'
import { masterDetailItemTitle } from './master-detail-constants'
import type { UseMasterDetailArrayResult } from './use-master-detail-array'
import type { MasterDetailListItem } from '../../components/master-detail/master-detail-list-panel'
import type { MasterDetailEditorIdentity } from '../../components/master-detail/master-detail-editor-shell'

export interface FormEmbeddedMasterDetailMapListItemContext {
  field: { id: string }
  index: number
  row: unknown
  entityCatalogLayer: ContentFormCtx['entityCatalogLayer']
  getRowIssueCount: (index: number) => number
}

export interface UseEmbeddedMasterDetailRowsParams {
  formCtx: ContentFormCtx
  fieldName: string
  editor: UseMasterDetailArrayResult
  itemFields: FormItem[]
  itemNoun: MasterDetailItemNounTerm
  mapListItem: (
    ctx: FormEmbeddedMasterDetailMapListItemContext,
  ) => Pick<MasterDetailListItem, 'title'> & { eyebrow?: string }
  access?: FormEmbeddedMasterDetailAccessConfig
  resolveRowReasons?: (ctx: {
    row: unknown
    rowKey: string
    index: number
  }) => readonly AvailabilityReason[]
  resolveAvailabilityFormItems?: (ctx: {
    row: unknown
    fieldId: string
    namePrefix: string
  }) => FormItem[] | undefined
  /** When set, replaces presentation-path issue counts for heterogeneous rows. */
  resolveRowIssueCount?: (index: number) => number
  showDelete?: boolean
}

export function useEmbeddedMasterDetailRows({
  formCtx,
  fieldName,
  editor,
  itemFields,
  itemNoun,
  mapListItem,
  access,
  resolveRowReasons,
  resolveAvailabilityFormItems,
  resolveRowIssueCount,
  showDelete = true,
}: UseEmbeddedMasterDetailRowsParams) {
  const watched = useWatch({ name: fieldName }) as unknown[] | undefined
  const availabilityDialogRef = useRef<HTMLDivElement>(null)
  const seedRowIds = useMemo(() => {
    const ids = formCtx.embeddedSeedRowIds?.[fieldName]
    return ids?.length ? new Set(ids) : undefined
  }, [formCtx.embeddedSeedRowIds, fieldName])

  const validation = useMasterDetailRowValidation(fieldName, itemFields)
  const getRowIssueCount = resolveRowIssueCount ?? validation.getRowIssueCount
  const showRowBadges = resolveRowIssueCount ? true : validation.showRowBadges

  const allRows = useMemo((): EmbeddedMasterDetailRow[] => {
    if (access) {
      return buildEmbeddedMasterDetailRows({
        fields: editor.fields,
        watched,
        formCtx,
        itemNoun,
        showDelete,
        access,
        mapListItem,
        getRowIssueCount,
        seedRowIds,
        resolveRowReasons,
      })
    }

    return editor.fields.map((field, formIndex) => {
      const row = watched?.[formIndex]
      const listDisplay = mapListItem({
        field,
        index: formIndex,
        row,
        entityCatalogLayer: formCtx.entityCatalogLayer,
        getRowIssueCount,
      })
      const item = buildEmbeddedMasterDetailListItem({
        field,
        index: formIndex,
        row: row as { id?: string } | undefined,
        entityCatalogLayer: formCtx.entityCatalogLayer,
        seedRowIds,
        getRowIssueCount,
        title: masterDetailItemTitle(listDisplay.title, itemNoun),
        eyebrow: listDisplay.eyebrow,
        showDelete,
        extraReasons:
          resolveRowReasons?.({
            row,
            rowKey: resolveMasterDetailRowKey(field.id, row as { id?: string } | undefined),
            index: formIndex,
          }) ?? [],
      })
      return {
        fieldId: field.id,
        formIndex,
        item,
        availability: {
          rowId: item.id,
          isAvailable: true,
          statusLabel: 'Available' as const,
        },
      }
    })
  }, [
    access,
    editor.fields,
    formCtx,
    getRowIssueCount,
    itemNoun,
    mapListItem,
    resolveRowReasons,
    seedRowIds,
    showDelete,
    watched,
  ])

  const selectedRow = useMemo(
    () => findEmbeddedMasterDetailRowByFieldId(allRows, editor.selectedFieldId),
    [allRows, editor.selectedFieldId],
  )

  const selectedDomainId = selectedRow?.item.id ?? null

  const selectedRowAvailability = useMemo((): Availability | undefined => {
    if (!selectedRow || !resolveRowReasons) return undefined
    const row = watched?.[selectedRow.formIndex]
    const extraReasons =
      resolveRowReasons({
        row,
        rowKey: selectedRow.item.id,
        index: selectedRow.formIndex,
      }) ?? []
    if (extraReasons.length === 0) return undefined
    return { status: 'inactive', reasons: [...extraReasons] }
  }, [resolveRowReasons, selectedRow, watched])

  const openAvailabilityDialog = useCallback(() => {
    openCampaignAvailabilityDialog(availabilityDialogRef.current)
  }, [])

  const selectedIdentity = useMemo((): MasterDetailEditorIdentity | undefined => {
    if (!selectedRow) return undefined
    const issueCount = showRowBadges ? (selectedRow.item.issueCount ?? 0) : 0
    return {
      title: selectedRow.item.title,
      meta: selectedRow.item.meta,
      deletable: selectedRow.item.deletable,
      ...(issueCount > 0 ? { issueCount } : {}),
      ...(access && selectedRow.availability
        ? {
            availability: selectedRow.availability,
            onAvailabilityChange: openAvailabilityDialog,
          }
        : {}),
    }
  }, [access, openAvailabilityDialog, selectedRow, showRowBadges])

  const availabilityFormItems = useMemo((): FormItem[] | undefined => {
    if (!access || !selectedRow || access.kind !== 'availability') return undefined
    const namePrefix = `${fieldName}.${selectedRow.formIndex}`
    const row = watched?.[selectedRow.formIndex]
    const custom = resolveAvailabilityFormItems?.({
      row,
      fieldId: selectedRow.fieldId,
      namePrefix,
    })
    if (custom) return custom
    return buildMasterDetailAvailabilityFormFields(selectedRow.fieldId)
  }, [access, fieldName, resolveAvailabilityFormItems, selectedRow, watched])

  const availabilityNamePrefix = useMemo(() => {
    if (!access || !selectedRow || access.kind !== 'availability') return undefined
    return `${fieldName}.${selectedRow.formIndex}`
  }, [access, fieldName, selectedRow])

  const deleteName =
    editor.deleteIndex !== null
      ? masterDetailItemTitle(
          mapListItem({
            field: editor.fields[editor.deleteIndex]!,
            index: editor.deleteIndex,
            row: watched?.[editor.deleteIndex],
            entityCatalogLayer: formCtx.entityCatalogLayer,
            getRowIssueCount,
          }).title,
          itemNoun,
        )
      : ''

  const rowAt = useCallback((index: number) => watched?.[index], [watched])

  return {
    rowAt,
    allRows,
    selectedRow,
    selectedDomainId,
    selectedIdentity,
    selectedRowAvailability,
    availabilityFormItems,
    availabilityNamePrefix,
    availabilityDialogRef,
    deleteName,
    showRowBadges,
  }
}
