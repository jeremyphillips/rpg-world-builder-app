import { useCallback, useMemo } from 'react'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { duplicateMasterDetailRow } from '../../lib/master-detail/duplicate-master-detail-row'
import type { FormEmbeddedMasterDetailAccessConfig } from '../../lib/master-detail/master-detail-access.types'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import type { EmbeddedMasterDetailRow } from '../../lib/master-detail/build-embedded-master-detail-rows'
import { useEmbeddedMasterDetailRows } from '../../lib/master-detail/use-embedded-master-detail-rows'
import { useMasterDetailCollectionAvailability } from '../../lib/master-detail/use-master-detail-collection-availability'
import type { UseMasterDetailArrayResult } from '../../lib/master-detail/use-master-detail-array'
import type { MasterDetailEditorIdentity } from './master-detail-editor-shell'
import type { FormEmbeddedMasterDetailEditorProps } from './form-embedded-master-detail-editor'

type EditorBodyInput<TRow> = Omit<
  FormEmbeddedMasterDetailEditorProps<TRow>,
  'editor' | 'makeItemDefaults'
> & {
  editor: UseMasterDetailArrayResult
}

function resolveEmbeddedDetailFields(
  itemFields: EditorBodyInput<unknown>['itemFields'],
  resolveItemFields: ((row: unknown) => FormItem[]) | undefined,
  selectedRow: EmbeddedMasterDetailRow | undefined,
  rowAt: (index: number) => unknown,
): FormItem[] {
  if (!resolveItemFields) {
    return Array.isArray(itemFields) ? itemFields : []
  }
  return resolveItemFields(selectedRow ? rowAt(selectedRow.formIndex) : undefined)
}

function embeddedMasterDetailRowsArgs<TRow>(input: EditorBodyInput<TRow>) {
  const shared = {
    formCtx: input.formCtx,
    fieldName: input.fieldName,
    editor: input.editor,
    itemFields: input.itemFields,
    itemNoun: input.itemNoun,
    access: input.access,
    resolveRowReasons: input.resolveRowReasons,
    resolveAvailabilityFormItems: input.resolveAvailabilityFormItems,
    showDelete: input.showDelete,
  }
  if (input.rowTitle) {
    return {
      ...shared,
      rowTitle: input.rowTitle,
      resolveListMeta: input.resolveListMeta,
    }
  }
  return {
    ...shared,
    mapListItem: input.mapListItem!,
  }
}

function resolveEmbeddedSelectedIdentity<TRow>(
  input: EditorBodyInput<TRow>,
  rows: ReturnType<typeof useEmbeddedMasterDetailRows<TRow>>,
): MasterDetailEditorIdentity | undefined {
  if (
    input.rowTitle ||
    !rows.selectedIdentity ||
    !input.resolveHeaderIdentity ||
    !rows.selectedRow
  ) {
    return rows.selectedIdentity
  }
  return input.resolveHeaderIdentity({
    row: rows.rowAt(rows.selectedRow.formIndex),
    index: rows.selectedRow.formIndex,
    fieldId: rows.selectedRow.fieldId,
    identity: rows.selectedIdentity,
  })
}

export function useFormEmbeddedMasterDetailEditorBody<TRow = Record<string, unknown>>(
  input: EditorBodyInput<TRow>,
) {
  const {
    formCtx,
    fieldName,
    itemFields,
    itemNoun,
    addControl: addControlProp,
    resolveItemFields,
    idPrefix,
    editor,
    access,
    listReorder = false,
  } = input

  const rows = useEmbeddedMasterDetailRows<TRow>(
    embeddedMasterDetailRowsArgs(input) as Parameters<typeof useEmbeddedMasterDetailRows<TRow>>[0],
  )

  const availabilityItems = useMemo(
    () => (access ? rows.allRows.map((row) => row.availability) : []),
    [access, rows.allRows],
  )

  const handleAvailabilitySelectionChange = useCallback(
    (rowId: string) => {
      const row = rows.allRows.find((entry) => entry.item.id === rowId)
      if (row) editor.select(row.formIndex)
    },
    [editor, rows.allRows],
  )

  const collection = useMasterDetailCollectionAvailability({
    items: availabilityItems,
    selectedId: access ? rows.selectedDomainId : null,
    onSelectedIdChange: access ? handleAvailabilitySelectionChange : undefined,
  })

  const visibleRows = useMemo(() => {
    if (!access) return rows.allRows
    const visibleIds = new Set(collection.visibleItems.map((item) => item.rowId))
    return rows.allRows.filter((row) => visibleIds.has(row.item.id))
  }, [access, collection.visibleItems, rows.allRows])

  const listItems = useMemo(() => visibleRows.map((row) => row.item), [visibleRows])

  const invalidItemCount = useMemo(() => {
    if (!rows.showRowBadges) return 0
    return listItems.filter((item) => (item.issueCount ?? 0) > 0).length
  }, [listItems, rows.showRowBadges])

  const isSelectedRowVisible = access
    ? collection.isSelectedVisible
    : rows.selectedDomainId !== null

  const handleSelectItem = useCallback(
    (id: string) => {
      const row = visibleRows.find((entry) => entry.item.id === id)
      if (row) editor.select(row.formIndex)
    },
    [editor, visibleRows],
  )

  const handleListMove = useCallback(
    (from: number, to: number) => {
      editor.move(from, to)
    },
    [editor],
  )

  const handleDuplicate = useCallback(() => {
    if (!rows.selectedRow) return
    const copy = duplicateMasterDetailRow(rows.rowAt(rows.selectedRow.formIndex))
    if (copy) editor.appendRow(copy)
  }, [editor, rows])

  const selectedIdentity = resolveEmbeddedSelectedIdentity(input, rows)

  const detailFields = resolveEmbeddedDetailFields(
    itemFields,
    resolveItemFields,
    rows.selectedRow,
    rows.rowAt,
  )

  const addControl = addControlProp

  return {
    rows,
    listItems,
    invalidItemCount,
    isSelectedRowVisible,
    handleSelectItem,
    onListMove: listReorder ? handleListMove : undefined,
    handleDuplicate,
    selectedIdentity,
    detailFields,
    addControl,
    formCtx,
    fieldName,
    idPrefix,
    itemNoun,
    editor,
    access,
    collection,
  }
}
