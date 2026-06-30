'use client'

import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { fieldGroupFlexStackClasses } from '@rpg/ui'
import { buildItemDefaultValues, type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { buildEmbeddedMasterDetailListItem } from '../../lib/master-detail/build-embedded-master-detail-list-item'
import { masterDetailEmptySelectionLabel } from '../../lib/master-detail/master-detail-constants'
import { showMasterDetailUnselectedRowErrors } from '../../lib/master-detail/master-detail-validation'
import {
  useMasterDetailArray,
  type UseMasterDetailArrayResult,
} from '../../lib/master-detail/use-master-detail-array'
import { MasterDetailDeleteDialog } from './master-detail-delete-dialog.client'
import { MasterDetailEditorPanel } from './master-detail-editor-panel.client'
import { MasterDetailListPanel, type MasterDetailListItem } from './master-detail-list-panel.client'

export interface FormEmbeddedMasterDetailMapListItemContext {
  field: { id: string }
  index: number
  row: unknown
  entitySource: ContentFormCtx['entitySource']
  hasRowError: (index: number) => boolean
}

export interface FormEmbeddedMasterDetailEditorProps {
  formCtx: ContentFormCtx
  /** Parent form field path, e.g. `traits`, `features`, or `heritage.options`. */
  fieldName: string
  itemFields: FormItem[]
  /** Singular noun for delete dialog and empty-selection copy, e.g. `trait`. */
  itemNoun: string
  ariaLabel: string
  addLabel: string
  emptyListLabel: string
  /** Prefix for detail `FormItems` ids, e.g. `species-trait`. */
  idPrefix: string
  mapListItem: (
    ctx: FormEmbeddedMasterDetailMapListItemContext,
  ) => Pick<MasterDetailListItem, 'title' | 'eyebrow'>
  /**
   * Optional pre-bound editor state. Pass when the parent must coordinate with
   * `useMasterDetailArray` (e.g. cancel a pending delete when removing a parent
   * object). When omitted, this component binds its own field array.
   */
  editor?: UseMasterDetailArrayResult
  /** When false, rows cannot be reordered. Defaults to `true`. */
  sortable?: boolean
  /** When false, hides row delete controls entirely. Defaults to `true`. */
  showDelete?: boolean
  /** When false, hides the campaign availability toggle. Defaults to `true`. */
  showActiveToggle?: boolean
  /**
   * Optional fields or chrome rendered above the list/detail grid with standard
   * field-group spacing (`fieldGroupFlexStackClasses`).
   */
  leadingContent?: ReactNode
}

interface FormEmbeddedMasterDetailEditorBodyProps extends FormEmbeddedMasterDetailEditorProps {
  editor: UseMasterDetailArrayResult
}

function FormEmbeddedMasterDetailEditorBody({
  formCtx,
  fieldName,
  itemFields,
  itemNoun,
  ariaLabel,
  addLabel,
  emptyListLabel,
  idPrefix,
  mapListItem,
  editor,
  sortable = true,
  showDelete = true,
  showActiveToggle = true,
  leadingContent,
}: FormEmbeddedMasterDetailEditorBodyProps) {
  const {
    formState: { submitCount },
  } = useFormContext()

  const watched = useWatch({ name: fieldName }) as unknown[] | undefined

  const seedRowIds = useMemo(() => {
    const ids = formCtx.embeddedSeedRowIds?.[fieldName]
    return ids?.length ? new Set(ids) : undefined
  }, [formCtx.embeddedSeedRowIds, fieldName])

  const items: MasterDetailListItem[] = editor.fields.map((field, index) => {
    const row = watched?.[index]
    const listDisplay = mapListItem({
      field,
      index,
      row,
      entitySource: formCtx.entitySource,
      hasRowError: editor.hasRowError,
    })
    return buildEmbeddedMasterDetailListItem({
      field,
      index,
      row: row as { id?: string } | undefined,
      entitySource: formCtx.entitySource,
      seedRowIds,
      activeById: editor.activeById,
      hasRowError: editor.hasRowError,
      title: listDisplay.title,
      eyebrow: listDisplay.eyebrow,
      showDelete,
    })
  })

  const showValidationBanner = showMasterDetailUnselectedRowErrors(editor, submitCount)

  const deleteName =
    editor.deleteIndex !== null
      ? mapListItem({
          field: editor.fields[editor.deleteIndex]!,
          index: editor.deleteIndex,
          row: watched?.[editor.deleteIndex],
          entitySource: formCtx.entitySource,
          hasRowError: editor.hasRowError,
        }).title
      : ''

  const selectedRow =
    editor.selectedIndex !== null
      ? (watched?.[editor.selectedIndex] as { id?: string } | undefined)
      : undefined

  const masterDetailGrid = (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <MasterDetailListPanel
        items={items}
        selectedIndex={editor.selectedIndex}
        ariaLabel={ariaLabel}
        addLabel={addLabel}
        emptyLabel={emptyListLabel}
        onAdd={editor.handleAdd}
        onSelect={editor.select}
        onRemove={editor.requestRemove}
        onMove={sortable ? editor.move : undefined}
      />

      <MasterDetailEditorPanel
        editor={editor}
        itemFields={itemFields}
        fieldName={fieldName}
        idPrefix={idPrefix}
        showValidationBanner={showValidationBanner}
        emptySelectionLabel={masterDetailEmptySelectionLabel(itemNoun)}
        showActiveToggle={showActiveToggle}
        selectedRow={selectedRow}
      />
    </div>
  )

  const deleteDialog = (
    <MasterDetailDeleteDialog
      open={editor.deleteIndex !== null}
      itemNoun={itemNoun}
      itemName={deleteName}
      onOpenChange={(open) => {
        if (!open) editor.cancelRemove()
      }}
      onConfirm={editor.confirmRemove}
    />
  )

  if (!leadingContent) {
    return (
      <>
        {masterDetailGrid}
        {deleteDialog}
      </>
    )
  }

  return (
    <>
      <div className={fieldGroupFlexStackClasses}>
        {leadingContent}
        {masterDetailGrid}
      </div>
      {deleteDialog}
    </>
  )
}

function FormEmbeddedMasterDetailEditorWithHook(
  props: Omit<FormEmbeddedMasterDetailEditorProps, 'editor'>,
) {
  const makeItemDefaults = useCallback(
    () => buildItemDefaultValues(props.itemFields),
    [props.itemFields],
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
  ...props
}: FormEmbeddedMasterDetailEditorProps) {
  if (editor) {
    return <FormEmbeddedMasterDetailEditorBody {...props} editor={editor} />
  }
  return <FormEmbeddedMasterDetailEditorWithHook {...props} />
}
