import type { ReactNode, RefObject } from 'react'
import { useCallback } from 'react'
import { fieldGroupFlexStackClasses } from '@rpg/ui'
import { buildItemDefaultValues, type FormItem } from '@rpg/ui/form'

import type { Availability, AvailabilityReason } from '@/lib/availability'
import type { EmbeddedArrayResolverFieldInput } from '../../lib/forms/validation/tabbed-form-resolver-fields'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import type { FormEmbeddedMasterDetailAccessConfig } from '../../lib/master-detail/master-detail-access.types'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import { masterDetailItemNounLabel } from '../../lib/master-detail/master-detail-constants'
import type { EmbeddedMasterDetailRow } from '../../lib/master-detail/build-embedded-master-detail-rows'
import type {
  MasterDetailListMetaInput,
  MasterDetailRowTitleConfig,
} from '../../lib/master-detail/master-detail-row-title'
import type { FormEmbeddedMasterDetailMapListItemContext } from '../../lib/master-detail/use-embedded-master-detail-rows'
import {
  useMasterDetailArray,
  type UseMasterDetailArrayResult,
} from '../../lib/master-detail/use-master-detail-array'
import { useFormEmbeddedMasterDetailEditorBody } from './use-form-embedded-master-detail-editor-body'
import { MasterDetailBodyCampaignAccessDialogFields } from './master-detail-body-campaign-access-dialog-fields'
import { MasterDetailDeleteDialog } from './master-detail-delete-dialog'
import { MasterDetailEditorPanel } from './master-detail-editor-panel'
import type { MasterDetailEditorIdentity } from './master-detail-editor-shell'
import { MasterDetailGrid } from './master-detail-grid'
import { MasterDetailListPanel, type MasterDetailListItem } from './master-detail-list-panel'

export type { FormEmbeddedMasterDetailMapListItemContext }

type FormEmbeddedMasterDetailEditorBase = {
  formCtx: ContentFormCtx
  /** Parent form field path, e.g. `traits`, `features`, or `heritage.options`. */
  fieldName: string
  itemFields: FormItem[] | EmbeddedArrayResolverFieldInput
  /** Singular noun vocabulary for delete dialog, empty copy, and overflow actions. */
  itemNoun: MasterDetailItemNounTerm
  /** Visible collection title in the list header. */
  listTitle: ReactNode
  /** Accessible name for the list nav — must remain independent from `listTitle`. */
  ariaLabel: string
  addLabel: string
  /** Replaces the default Add button without going through `renderAddControl`. */
  addControl?: ReactNode
  /** Row-specific detail fields. When omitted, every row uses `itemFields`. */
  resolveItemFields?: (row: unknown) => FormItem[]
  /** Prefix for detail `FormItems` ids, e.g. `species-trait`. */
  idPrefix: string
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
  /** Enables drag-to-reorder on the flat list rail; calls `editor.move` on drop. */
  listReorder?: boolean
}

export type FormEmbeddedMasterDetailEditorProps<TRow = Record<string, unknown>> =
  FormEmbeddedMasterDetailEditorBase &
    (
      | {
          rowTitle: MasterDetailRowTitleConfig<TRow>
          resolveListMeta?: (
            ctx: FormEmbeddedMasterDetailMapListItemContext,
          ) => MasterDetailListMetaInput
          mapListItem?: never
          resolveHeaderIdentity?: never
        }
      | {
          rowTitle?: never
          resolveListMeta?: never
          mapListItem: (
            ctx: FormEmbeddedMasterDetailMapListItemContext,
          ) => Pick<MasterDetailListItem, 'title'> & MasterDetailListMetaInput
          /** Adjusts the selected detail header without a title render prop. */
          resolveHeaderIdentity?: (ctx: {
            row: unknown
            index: number
            fieldId: string
            identity: MasterDetailEditorIdentity
          }) => MasterDetailEditorIdentity
        }
    )

interface FormEmbeddedMasterDetailEditorBodyProps<TRow = Record<string, unknown>> extends Omit<
  FormEmbeddedMasterDetailEditorProps<TRow>,
  'editor' | 'makeItemDefaults'
> {
  editor: UseMasterDetailArrayResult
}

function embeddedCampaignAccessDialog(input: {
  access: FormEmbeddedMasterDetailAccessConfig | undefined
  formCtx: ContentFormCtx
  fieldName: string
  idPrefix: string
  selectedRow: EmbeddedMasterDetailRow | undefined
  dialogRef: RefObject<HTMLDivElement | null>
}): ReactNode {
  if (input.access?.kind !== 'campaignAccess' || !input.selectedRow) return null
  return (
    <MasterDetailBodyCampaignAccessDialogFields
      access={input.access}
      formCtx={input.formCtx}
      fieldName={input.fieldName}
      idPrefix={input.idPrefix}
      selectedRow={input.selectedRow}
      dialogRef={input.dialogRef}
    />
  )
}

function FormEmbeddedMasterDetailEditorBody<TRow = Record<string, unknown>>({
  leadingContent,
  listTitle,
  ariaLabel,
  addLabel,
  ...props
}: FormEmbeddedMasterDetailEditorBodyProps<TRow>) {
  const body = useFormEmbeddedMasterDetailEditorBody(props)
  const campaignAccessDialog = embeddedCampaignAccessDialog({
    access: props.access,
    formCtx: body.formCtx,
    fieldName: body.fieldName,
    idPrefix: body.idPrefix,
    selectedRow: body.rows.selectedRow,
    dialogRef: body.rows.availabilityDialogRef,
  })

  return (
    <EmbeddedMasterDetailLayout
      leadingContent={leadingContent}
      listItems={body.listItems}
      selectedItemId={body.isSelectedRowVisible ? body.rows.selectedDomainId : null}
      listTitle={listTitle}
      ariaLabel={ariaLabel}
      addLabel={addLabel}
      itemNoun={body.itemNoun}
      countSupplement={body.access ? body.collection.countSupplement : undefined}
      invalidItemCount={body.invalidItemCount}
      onSelectItem={body.handleSelectItem}
      addControl={body.addControl}
      onAdd={body.editor.handleAdd}
      editor={body.editor}
      itemFields={body.detailFields}
      fieldName={body.fieldName}
      idPrefix={body.idPrefix}
      showSelectedDetail={body.isSelectedRowVisible}
      selectedIdentity={body.selectedIdentity}
      campaignId={body.formCtx.campaignId}
      rowAvailability={body.rows.selectedRowAvailability}
      availabilityFormItems={body.rows.availabilityFormItems}
      availabilityNamePrefix={body.rows.availabilityNamePrefix}
      availabilityDialogRef={body.rows.availabilityDialogRef}
      onDuplicate={body.rows.selectedRow ? body.handleDuplicate : undefined}
      onListMove={body.onListMove}
      deleteOpen={body.editor.deleteIndex !== null}
      deleteName={body.rows.deleteName}
      onCancelDelete={body.editor.cancelRemove}
      onConfirmDelete={body.editor.confirmRemove}
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
  onListMove,
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
  onListMove?: (from: number, to: number) => void
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
        onListMove={onListMove}
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

function FormEmbeddedMasterDetailEditorWithHook<TRow = Record<string, unknown>>({
  makeItemDefaults: makeItemDefaultsProp,
  ...props
}: Omit<FormEmbeddedMasterDetailEditorProps<TRow>, 'editor'>) {
  const makeItemDefaults = useCallback(
    () =>
      makeItemDefaultsProp?.() ??
      buildItemDefaultValues(Array.isArray(props.itemFields) ? props.itemFields : []),
    [makeItemDefaultsProp, props.itemFields],
  )
  const editor = useMasterDetailArray(props.fieldName, makeItemDefaults)
  return <FormEmbeddedMasterDetailEditorBody<TRow> {...props} editor={editor} />
}

/**
 * Master-detail editor for an embedded parent-form field array: list on the
 * left, selected row `FormItems` on the right, shared delete-confirm flow.
 */
export function FormEmbeddedMasterDetailEditor<TRow = Record<string, unknown>>({
  editor,
  makeItemDefaults,
  ...props
}: FormEmbeddedMasterDetailEditorProps<TRow>) {
  if (editor) {
    return <FormEmbeddedMasterDetailEditorBody<TRow> {...props} editor={editor} />
  }
  return (
    <FormEmbeddedMasterDetailEditorWithHook<TRow> makeItemDefaults={makeItemDefaults} {...props} />
  )
}
