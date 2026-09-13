import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { fieldGroupFlexStackClasses } from '@rpg/ui'
import { buildItemDefaultValues, type FormItem } from '@rpg/ui/form'

import type { Availability, AvailabilityReason } from '@/lib/availability'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { resolveMasterDetailRowKey } from '../../lib/master-detail/content-campaign-availability'
import { buildEmbeddedMasterDetailListItem } from '../../lib/master-detail/build-embedded-master-detail-list-item'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import {
  masterDetailItemNounLabel,
  masterDetailItemTitle,
} from '../../lib/master-detail/master-detail-constants'
import { showMasterDetailUnselectedRowErrors } from '../../lib/master-detail/master-detail-validation'
import {
  useMasterDetailArray,
  type UseMasterDetailArrayResult,
} from '../../lib/master-detail/use-master-detail-array'
import { MasterDetailDeleteDialog } from './master-detail-delete-dialog'
import { MasterDetailEditorPanel } from './master-detail-editor-panel'
import { MasterDetailGrid } from './master-detail-grid'
import { MasterDetailListPanel, type MasterDetailListItem } from './master-detail-list-panel'

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
      hasRowError: editor.hasRowError,
      title: masterDetailItemTitle(listDisplay.title, itemNoun),
      eyebrow: listDisplay.eyebrow,
      showDelete,
      extraReasons: resolveRowReasons?.({
        row,
        rowKey: resolveMasterDetailRowKey(field.id, row as { id?: string } | undefined),
        index,
      }),
    })
  })

  const selectedRowAvailability = useMemo((): Availability | undefined => {
    if (editor.selectedIndex === null) return undefined
    const field = editor.fields[editor.selectedIndex]
    if (!field) return undefined
    const row = watched?.[editor.selectedIndex]
    const rowKey = resolveMasterDetailRowKey(field.id, row as { id?: string } | undefined)
    const extraReasons = resolveRowReasons?.({ row, rowKey, index: editor.selectedIndex }) ?? []
    if (extraReasons.length === 0) return undefined
    return { status: 'inactive', reasons: [...extraReasons] }
  }, [editor.fields, editor.selectedIndex, resolveRowReasons, watched])

  const selectedIdentity = useMemo(() => {
    if (editor.selectedIndex === null) return undefined
    const item = items[editor.selectedIndex]
    if (!item) return undefined
    return {
      title: item.title,
      meta: item.meta,
      deletable: item.deletable,
    }
  }, [editor.selectedIndex, items])

  const showValidationBanner = showMasterDetailUnselectedRowErrors(editor, submitCount)

  const deleteName =
    editor.deleteIndex !== null
      ? masterDetailItemTitle(
          mapListItem({
            field: editor.fields[editor.deleteIndex]!,
            index: editor.deleteIndex,
            row: watched?.[editor.deleteIndex],
            entitySource: formCtx.entitySource,
            hasRowError: editor.hasRowError,
          }).title,
          itemNoun,
        )
      : ''

  const masterDetailGrid = (
    <MasterDetailGrid>
      <MasterDetailListPanel
        items={items}
        selectedIndex={editor.selectedIndex}
        listTitle={listTitle}
        ariaLabel={ariaLabel}
        addLabel={addLabel}
        itemNoun={itemNoun}
        onAdd={editor.handleAdd}
        onSelect={editor.select}
      />

      <MasterDetailEditorPanel
        editor={editor}
        itemFields={itemFields}
        fieldName={fieldName}
        idPrefix={idPrefix}
        itemNoun={itemNoun}
        selectedIdentity={selectedIdentity}
        showValidationBanner={showValidationBanner}
        campaignId={formCtx.campaignId}
        rowAvailability={selectedRowAvailability}
      />
    </MasterDetailGrid>
  )

  const deleteDialog = (
    <MasterDetailDeleteDialog
      open={editor.deleteIndex !== null}
      itemNoun={masterDetailItemNounLabel(itemNoun)}
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
