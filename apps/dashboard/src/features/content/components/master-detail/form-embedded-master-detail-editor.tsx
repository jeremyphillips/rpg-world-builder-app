import type { ReactNode, RefObject } from 'react'
import { useCallback, useMemo } from 'react'
import { fieldGroupFlexStackClasses } from '@rpg/ui'
import { buildItemDefaultValues, type FormItem } from '@rpg/ui/form'

import type { Availability, AvailabilityReason } from '@/lib/availability'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { duplicateMasterDetailRow } from '../../lib/master-detail/duplicate-master-detail-row'
import type { FormEmbeddedMasterDetailAccessConfig } from '../../lib/master-detail/master-detail-access.types'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import { masterDetailItemNounLabel } from '../../lib/master-detail/master-detail-constants'
import {
  useEmbeddedMasterDetailRows,
  type FormEmbeddedMasterDetailMapListItemContext,
} from '../../lib/master-detail/use-embedded-master-detail-rows'
import { useMasterDetailCollectionAvailability } from '../../lib/master-detail/use-master-detail-collection-availability'
import {
  useMasterDetailArray,
  type UseMasterDetailArrayResult,
} from '../../lib/master-detail/use-master-detail-array'
import { MasterDetailBodyCampaignAccessDialogFields } from './master-detail-body-campaign-access-dialog-fields'
import { MasterDetailDeleteDialog } from './master-detail-delete-dialog'
import { MasterDetailEditorPanel } from './master-detail-editor-panel'
import type { MasterDetailEditorIdentity } from './master-detail-editor-shell'
import { MasterDetailGrid } from './master-detail-grid'
import { MasterDetailListPanel, type MasterDetailListItem } from './master-detail-list-panel'

export type { FormEmbeddedMasterDetailMapListItemContext }

export interface FormEmbeddedMasterDetailEditorProps {
  formCtx: ContentFormCtx
  /** Parent form field path, e.g. `traits`, `features`, or `heritage.options`. */
  fieldName: string
  itemFields: FormItem[]
  /** Singular noun vocabulary for delete dialog, empty copy, and overflow actions. */
  itemNoun: MasterDetailItemNounTerm
  /** Visible collection title in the list header. */
  listTitle: ReactNode
  /** Accessible name for the list nav — must remain independent from `listTitle`. */
  ariaLabel: string
  addLabel: string
  /** Prefix for detail `FormItems` ids, e.g. `species-trait`. */
  idPrefix: string
  mapListItem: (
    ctx: FormEmbeddedMasterDetailMapListItemContext,
  ) => Pick<MasterDetailListItem, 'title'> & { eyebrow?: string }
  /**
   * Optional pre-bound editor state. Pass when the parent must coordinate with
   * `useMasterDetailArray` (e.g. level normalization or cancel a pending delete
   * when removing a parent object). When omitted, this component binds its own
   * field array.
   */
  editor?: UseMasterDetailArrayResult
  /**
   * Factory for newly appended rows. When omitted, defaults are derived from
   * `itemFields`. Pass this to seed hidden form state that is not a visible field
   * (for example a discriminator that must still be complete). Ignored when
   * `editor` is provided — that hook already owns its factory.
   */
  makeItemDefaults?: () => Record<string, unknown>
  /** When false, hides detail overflow delete. Defaults to `true`. */
  showDelete?: boolean
  /**
   * Optional fields or chrome rendered above the list/detail grid with standard
   * field-group spacing (`fieldGroupFlexStackClasses`).
   */
  leadingContent?: ReactNode
  resolveRowReasons?: (ctx: {
    row: unknown
    rowKey: string
    index: number
  }) => readonly AvailabilityReason[]
  /** Override availability dialog fields for a selected row. */
  resolveAvailabilityFormItems?: (ctx: {
    row: unknown
    fieldId: string
    namePrefix: string
  }) => FormItem[] | undefined
  /** Mutually exclusive row access presentation and filtering. */
  access?: FormEmbeddedMasterDetailAccessConfig
  /** Replaces the default Add button. `append` inserts a caller-built row. */
  renderAddControl?: (ctx: { append: (row: Record<string, unknown>) => void }) => ReactNode
}

interface FormEmbeddedMasterDetailEditorBodyProps extends Omit<
  FormEmbeddedMasterDetailEditorProps,
  'editor' | 'makeItemDefaults'
> {
  editor: UseMasterDetailArrayResult
}

function FormEmbeddedMasterDetailEditorBody({
  formCtx,
  fieldName,
  itemFields,
  itemNoun,
  listTitle,
  ariaLabel,
  addLabel,
  idPrefix,
  mapListItem,
  editor,
  showDelete = true,
  leadingContent,
  resolveRowReasons,
  resolveAvailabilityFormItems,
  access,
  renderAddControl,
}: FormEmbeddedMasterDetailEditorBodyProps) {
  const rows = useEmbeddedMasterDetailRows({
    formCtx,
    fieldName,
    editor,
    itemFields,
    itemNoun,
    mapListItem,
    access,
    resolveRowReasons,
    resolveAvailabilityFormItems,
    showDelete,
  })

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

  const handleDuplicate = useCallback(() => {
    if (!rows.selectedRow) return
    const copy = duplicateMasterDetailRow(rows.rowAt(rows.selectedRow.formIndex))
    if (copy) editor.appendRow(copy)
  }, [editor, rows])

  const addControl = renderAddControl?.({ append: editor.appendRow })
  const campaignAccessDialog =
    access?.kind === 'campaignAccess' && rows.selectedRow ? (
      <MasterDetailBodyCampaignAccessDialogFields
        access={access}
        formCtx={formCtx}
        fieldName={fieldName}
        idPrefix={idPrefix}
        selectedRow={rows.selectedRow}
        dialogRef={rows.availabilityDialogRef}
      />
    ) : null

  return (
    <EmbeddedMasterDetailLayout
      leadingContent={leadingContent}
      listItems={listItems}
      selectedItemId={isSelectedRowVisible ? rows.selectedDomainId : null}
      listTitle={listTitle}
      ariaLabel={ariaLabel}
      addLabel={addLabel}
      itemNoun={itemNoun}
      countSupplement={access ? collection.countSupplement : undefined}
      invalidItemCount={invalidItemCount}
      onSelectItem={handleSelectItem}
      addControl={addControl}
      onAdd={editor.handleAdd}
      editor={editor}
      itemFields={itemFields}
      fieldName={fieldName}
      idPrefix={idPrefix}
      showSelectedDetail={isSelectedRowVisible}
      selectedIdentity={rows.selectedIdentity}
      campaignId={formCtx.campaignId}
      rowAvailability={rows.selectedRowAvailability}
      availabilityFormItems={rows.availabilityFormItems}
      availabilityNamePrefix={rows.availabilityNamePrefix}
      availabilityDialogRef={rows.availabilityDialogRef}
      onDuplicate={rows.selectedRow ? handleDuplicate : undefined}
      deleteOpen={editor.deleteIndex !== null}
      deleteName={rows.deleteName}
      onCancelDelete={editor.cancelRemove}
      onConfirmDelete={editor.confirmRemove}
      campaignAccessDialog={campaignAccessDialog}
    />
  )
}

function EmbeddedMasterDetailLayout({
  leadingContent,
  campaignAccessDialog,
  deleteOpen,
  deleteName,
  itemNoun,
  onCancelDelete,
  onConfirmDelete,
  listItems,
  selectedItemId,
  listTitle,
  ariaLabel,
  addLabel,
  countSupplement,
  invalidItemCount,
  onSelectItem,
  addControl,
  onAdd,
  editor,
  itemFields,
  fieldName,
  idPrefix,
  showSelectedDetail,
  selectedIdentity,
  campaignId,
  rowAvailability,
  availabilityFormItems,
  availabilityNamePrefix,
  availabilityDialogRef,
  onDuplicate,
}: {
  leadingContent?: ReactNode
  campaignAccessDialog: ReactNode
  deleteOpen: boolean
  deleteName: string
  itemNoun: MasterDetailItemNounTerm
  onCancelDelete: () => void
  onConfirmDelete: () => void
  listItems: MasterDetailListItem[]
  selectedItemId: string | null
  listTitle: ReactNode
  ariaLabel: string
  addLabel: string
  countSupplement?: ReactNode
  invalidItemCount: number
  onSelectItem: (id: string) => void
  addControl?: ReactNode
  onAdd: () => void
  editor: UseMasterDetailArrayResult
  itemFields: FormItem[]
  fieldName: string
  idPrefix: string
  showSelectedDetail: boolean
  selectedIdentity?: MasterDetailEditorIdentity
  campaignId?: string
  rowAvailability?: Availability
  availabilityFormItems?: FormItem[]
  availabilityNamePrefix?: string
  availabilityDialogRef?: RefObject<HTMLDivElement | null>
  onDuplicate?: () => void
}) {
  const grid = (
    <MasterDetailGrid>
      <MasterDetailListPanel
        items={listItems}
        selectedItemId={selectedItemId}
        listTitle={listTitle}
        ariaLabel={ariaLabel}
        addLabel={addLabel}
        itemNoun={itemNoun}
        countSupplement={countSupplement}
        invalidItemCount={invalidItemCount}
        onSelectItem={onSelectItem}
        {...(addControl ? { addControl } : { onAdd })}
      />
      <MasterDetailEditorPanel
        editor={editor}
        itemFields={itemFields}
        fieldName={fieldName}
        idPrefix={idPrefix}
        itemNoun={itemNoun}
        showSelectedDetail={showSelectedDetail}
        selectedIdentity={selectedIdentity}
        campaignId={campaignId}
        rowAvailability={rowAvailability}
        availabilityFormItems={availabilityFormItems}
        availabilityNamePrefix={availabilityNamePrefix}
        availabilityDialogRef={availabilityDialogRef}
        onDuplicate={onDuplicate}
      />
    </MasterDetailGrid>
  )
  const deleteDialog = (
    <MasterDetailDeleteDialog
      open={deleteOpen}
      itemNoun={masterDetailItemNounLabel(itemNoun)}
      itemName={deleteName}
      onOpenChange={(open) => {
        if (!open) onCancelDelete()
      }}
      onConfirm={onConfirmDelete}
    />
  )
  const gridWithLeading = leadingContent ? (
    <div className={fieldGroupFlexStackClasses}>
      {leadingContent}
      {grid}
    </div>
  ) : (
    grid
  )

  return (
    <>
      {gridWithLeading}
      {campaignAccessDialog}
      {deleteDialog}
    </>
  )
}

function FormEmbeddedMasterDetailEditorWithHook({
  makeItemDefaults: makeItemDefaultsProp,
  ...props
}: Omit<FormEmbeddedMasterDetailEditorProps, 'editor'>) {
  const makeItemDefaults = useCallback(
    () => makeItemDefaultsProp?.() ?? buildItemDefaultValues(props.itemFields),
    [makeItemDefaultsProp, props.itemFields],
  )
  const editor = useMasterDetailArray(props.fieldName, makeItemDefaults)
  return <FormEmbeddedMasterDetailEditorBody {...props} editor={editor} />
}

/**
 * Master-detail editor for an embedded parent-form field array: list on the
 * left, selected row `FormItems` on the right, shared delete-confirm flow.
 */
export function FormEmbeddedMasterDetailEditor({
  editor,
  makeItemDefaults,
  ...props
}: FormEmbeddedMasterDetailEditorProps) {
  if (editor) {
    return <FormEmbeddedMasterDetailEditorBody {...props} editor={editor} />
  }
  return <FormEmbeddedMasterDetailEditorWithHook makeItemDefaults={makeItemDefaults} {...props} />
}
