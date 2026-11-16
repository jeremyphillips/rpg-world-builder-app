import { useCallback, useMemo, useRef } from 'react'
import { useWatch } from 'react-hook-form'
import type { FormItem } from '@rpg/ui/form'

import type { EmbeddedArrayResolverFieldInput } from '../forms/validation/tabbed-form-resolver-fields'

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
import { buildSelectedMasterDetailIdentity } from './build-selected-master-detail-identity'
import type { FormEmbeddedMasterDetailAccessConfig } from './master-detail-access.types'
import { buildMasterDetailAvailabilityFormFields } from './master-detail-availability-form-fields'
import { useMasterDetailRowValidation } from './master-detail-row-validation'
import type { MasterDetailItemNounTerm } from './master-detail-item-noun'
import type { UseMasterDetailArrayResult } from './use-master-detail-array'
import type { MasterDetailListItem } from '../../components/master-detail/master-detail-list-panel'
import type { MasterDetailEditorIdentity } from '../../components/master-detail/master-detail-editor-shell'
import { embeddedListItemTitle, resolveEmbeddedListDisplay } from './resolve-embedded-list-display'
import type {
  MasterDetailListMetaInput,
  MasterDetailRowTitleConfig,
} from './master-detail-row-title'

export interface FormEmbeddedMasterDetailMapListItemContext {
  field: { id: string }
  index: number
  row: unknown
  entityCatalogLayer: ContentFormCtx['entityCatalogLayer']
  getRowIssueCount: (index: number) => number
}

type MapListItemFn = (
  ctx: FormEmbeddedMasterDetailMapListItemContext,
) => Pick<MasterDetailListItem, 'title'> & MasterDetailListMetaInput

interface UseEmbeddedMasterDetailRowsBase {
  formCtx: ContentFormCtx
  fieldName: string
  editor: UseMasterDetailArrayResult
  itemFields: FormItem[] | EmbeddedArrayResolverFieldInput
  itemNoun: MasterDetailItemNounTerm
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
  /** Detail caption placement for every row in this array, such as "Actions". */
  sectionLabel?: string
}

export type UseEmbeddedMasterDetailRowsParams<TRow = Record<string, unknown>> =
  UseEmbeddedMasterDetailRowsBase &
    (
      | {
          rowTitle: MasterDetailRowTitleConfig<TRow>
          resolveListMeta?: (
            ctx: FormEmbeddedMasterDetailMapListItemContext,
          ) => MasterDetailListMetaInput
          mapListItem?: never
        }
      | {
          rowTitle?: never
          resolveListMeta?: never
          mapListItem: MapListItemFn
        }
    )

export function useEmbeddedMasterDetailRows<TRow = Record<string, unknown>>({
  formCtx,
  fieldName,
  editor,
  itemFields,
  itemNoun,
  mapListItem,
  rowTitle,
  resolveListMeta,
  access,
  resolveRowReasons,
  resolveAvailabilityFormItems,
  resolveRowIssueCount,
  showDelete = true,
  sectionLabel,
}: UseEmbeddedMasterDetailRowsParams<TRow>) {
  const watched = useWatch({ name: fieldName }) as unknown[] | undefined
  const availabilityDialogRef = useRef<HTMLDivElement>(null)
  const persistedRowIds = useMemo(() => {
    const ids = formCtx.embeddedSeedRowIds?.[fieldName]
    return ids?.length ? new Set(ids) : undefined
  }, [formCtx.embeddedSeedRowIds, fieldName])
  const systemOriginRowIds = useMemo(() => {
    const ids = formCtx.embeddedSystemOriginRowIds?.[fieldName]
    return ids?.length ? new Set(ids) : undefined
  }, [formCtx.embeddedSystemOriginRowIds, fieldName])

  const validation = useMasterDetailRowValidation(fieldName, itemFields)
  const { getRowHeaderIssues } = validation
  const getRowIssueCount = resolveRowIssueCount ?? validation.getRowIssueCount
  const showRowBadges = resolveRowIssueCount ? true : validation.showRowBadges

  const rowsSnapshot = (watched ?? []) as readonly TRow[]

  const resolveListDisplay = useCallback(
    (mapCtx: FormEmbeddedMasterDetailMapListItemContext) =>
      resolveEmbeddedListDisplay({
        rowTitle,
        mapListItem,
        resolveListMeta,
        mapCtx,
        rows: rowsSnapshot,
        itemNoun,
        lastAddedFieldId: editor.lastAddedFieldId,
      }),
    [editor.lastAddedFieldId, itemNoun, mapListItem, resolveListMeta, rowTitle, rowsSnapshot],
  )

  const allRows = useMemo((): EmbeddedMasterDetailRow[] => {
    if (access) {
      return buildEmbeddedMasterDetailRows({
        fields: editor.fields,
        watched,
        formCtx,
        itemNoun,
        showDelete,
        access,
        resolveListDisplay,
        getRowIssueCount,
        persistedRowIds,
        systemOriginRowIds,
        sectionLabel,
        resolveRowReasons,
      })
    }

    return editor.fields.map((field, formIndex) => {
      const row = watched?.[formIndex]
      const listDisplay = resolveListDisplay({
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
        persistedRowIds,
        systemOriginRowIds,
        getRowIssueCount,
        title: embeddedListItemTitle(listDisplay, itemNoun),
        eyebrow: listDisplay.eyebrow,
        kindLabel: listDisplay.kindLabel,
        summary: listDisplay.summary,
        sectionLabel,
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
    resolveListDisplay,
    resolveRowReasons,
    persistedRowIds,
    systemOriginRowIds,
    sectionLabel,
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
    const row = watched?.[selectedRow.formIndex]
    const listDisplay = resolveListDisplay({
      field: { id: selectedRow.fieldId },
      index: selectedRow.formIndex,
      row,
      entityCatalogLayer: formCtx.entityCatalogLayer,
      getRowIssueCount,
    })
    return buildSelectedMasterDetailIdentity({
      selectedRow,
      row,
      listDisplay,
      issueCount: showRowBadges ? (selectedRow.item.issueCount ?? 0) : 0,
      headerIssues: getRowHeaderIssues(selectedRow.formIndex),
      availability: access ? selectedRow.availability : undefined,
      onAvailabilityChange: access ? openAvailabilityDialog : undefined,
    })
  }, [
    access,
    formCtx.entityCatalogLayer,
    getRowHeaderIssues,
    getRowIssueCount,
    openAvailabilityDialog,
    resolveListDisplay,
    selectedRow,
    showRowBadges,
    watched,
  ])

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

  const deleteName = useMemo(() => {
    if (editor.deleteIndex === null) return ''
    const mapCtx = {
      field: editor.fields[editor.deleteIndex]!,
      index: editor.deleteIndex,
      row: watched?.[editor.deleteIndex],
      entityCatalogLayer: formCtx.entityCatalogLayer,
      getRowIssueCount,
    }
    const listDisplay = resolveListDisplay(mapCtx)
    return embeddedListItemTitle(listDisplay, itemNoun)
  }, [
    editor.deleteIndex,
    editor.fields,
    formCtx.entityCatalogLayer,
    getRowIssueCount,
    itemNoun,
    resolveListDisplay,
    watched,
  ])

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
