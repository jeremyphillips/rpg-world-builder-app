import type { ReactNode } from 'react'
import { useCallback, useMemo, useRef } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { fieldGroupFlexStackClasses } from '@rpg/ui'
import { buildItemDefaultValues, type FormItem } from '@rpg/ui/form'

import type { Availability, AvailabilityReason } from '@/lib/availability'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { buildAvailabilityCountSupplement } from '../../lib/campaign-access/availability-count-supplement'
import { openCampaignAvailabilityDialog } from '../../lib/campaign-access/open-campaign-availability-dialog.lib'
import { buildEmbeddedMasterDetailListItem } from '../../lib/master-detail/build-embedded-master-detail-list-item'
import {
  buildEmbeddedMasterDetailRows,
  findEmbeddedMasterDetailRowByFieldId,
  type EmbeddedMasterDetailRow,
} from '../../lib/master-detail/build-embedded-master-detail-rows'
import { resolveMasterDetailRowKey } from '../../lib/master-detail/content-campaign-availability'
import {
  normalizeFormEmbeddedMasterDetailAccess,
  type FormEmbeddedMasterDetailAccessConfig,
} from '../../lib/master-detail/master-detail-access.types'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import {
  masterDetailItemNounLabel,
  masterDetailItemTitle,
} from '../../lib/master-detail/master-detail-constants'
import { buildMasterDetailAvailabilityFormFields } from '../../lib/master-detail/master-detail-availability-form-fields'
import { showMasterDetailUnselectedRowErrors } from '../../lib/master-detail/master-detail-validation'
import { MasterDetailBodyCampaignAccessDialogFields } from './master-detail-body-campaign-access-dialog-fields'
import { useMasterDetailAvailabilityFilter } from '../../lib/master-detail/use-master-detail-availability-filter'
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
  /** Mutually exclusive row access presentation and filtering. */
  access?: FormEmbeddedMasterDetailAccessConfig
  /** @deprecated Use `access={{ kind: 'availability', fieldName: 'available' }}`. */
  availability?: { fieldName: string }
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
  access: accessProp,
  availability,
}: FormEmbeddedMasterDetailEditorBodyProps) {
  const {
    formState: { submitCount },
  } = useFormContext()

  const access = normalizeFormEmbeddedMasterDetailAccess(accessProp, availability)
  const watched = useWatch({ name: fieldName }) as unknown[] | undefined
  const availabilityDialogRef = useRef<HTMLDivElement>(null)
  const seedRowIds = useMemo(() => {
    const ids = formCtx.embeddedSeedRowIds?.[fieldName]
    return ids?.length ? new Set(ids) : undefined
  }, [formCtx.embeddedSeedRowIds, fieldName])

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
        hasRowError: editor.hasRowError,
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
        entitySource: formCtx.entitySource,
        hasRowError: editor.hasRowError,
      })
      const item = buildEmbeddedMasterDetailListItem({
        field,
        index: formIndex,
        row: row as { id?: string } | undefined,
        entitySource: formCtx.entitySource,
        seedRowIds,
        hasRowError: editor.hasRowError,
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
          rowId: field.id,
          isAvailable: true,
          statusLabel: 'Available' as const,
        },
      }
    })
  }, [
    access,
    editor.fields,
    editor.hasRowError,
    formCtx,
    itemNoun,
    mapListItem,
    resolveRowReasons,
    seedRowIds,
    showDelete,
    watched,
  ])

  const availabilityItems = useMemo(
    () => (access ? allRows.map((row) => row.availability) : []),
    [access, allRows],
  )

  const handleAvailabilitySelectionChange = useCallback(
    (rowId: string) => {
      const row = allRows.find((entry) => entry.fieldId === rowId)
      if (row) editor.select(row.formIndex)
    },
    [allRows, editor],
  )

  const {
    showUnavailable,
    scope,
    visibleItems,
    hiddenUnavailableCount,
    showUnavailableItems,
    hideUnavailableItems,
  } = useMasterDetailAvailabilityFilter({
    items: availabilityItems,
    selectedRowId: editor.selectedFieldId,
    onSelectedRowIdChange: handleAvailabilitySelectionChange,
  })

  const visibleRows = useMemo(() => {
    if (!access) return allRows
    const visibleIds = new Set(visibleItems.map((item) => item.rowId))
    return allRows.filter((row) => visibleIds.has(row.fieldId))
  }, [access, allRows, visibleItems])

  const listItems = useMemo(() => visibleRows.map((row) => row.item), [visibleRows])

  const selectedRow = useMemo(
    () => findEmbeddedMasterDetailRowByFieldId(allRows, editor.selectedFieldId),
    [allRows, editor.selectedFieldId],
  )

  const selectedRowAvailability = useMemo((): Availability | undefined => {
    if (!selectedRow || !resolveRowReasons) return undefined
    const row = watched?.[selectedRow.formIndex]
    const extraReasons =
      resolveRowReasons({
        row,
        rowKey: selectedRow.fieldId,
        index: selectedRow.formIndex,
      }) ?? []
    if (extraReasons.length === 0) return undefined
    return { status: 'inactive', reasons: [...extraReasons] }
  }, [resolveRowReasons, selectedRow, watched])

  const selectedIdentity = useMemo(() => {
    if (!selectedRow) return undefined
    return {
      title: selectedRow.item.title,
      meta: selectedRow.item.meta,
      deletable: selectedRow.item.deletable,
      ...(access && selectedRow.availability
        ? {
            availability: selectedRow.availability,
            onAvailabilityChange: () =>
              openCampaignAvailabilityDialog(availabilityDialogRef.current),
          }
        : {}),
    }
  }, [access, selectedRow])

  const availabilityFormItems = useMemo((): FormItem[] | undefined => {
    if (!access || !selectedRow || access.kind !== 'availability') return undefined
    return buildMasterDetailAvailabilityFormFields(selectedRow.fieldId)
  }, [access, selectedRow])

  const availabilityNamePrefix = useMemo(() => {
    if (!access || !selectedRow || access.kind !== 'availability') return undefined
    return `${fieldName}.${selectedRow.formIndex}`
  }, [access, fieldName, selectedRow])

  const campaignAccessDialog =
    access?.kind === 'campaignAccess' && selectedRow ? (
      <MasterDetailBodyCampaignAccessDialogFields
        access={access}
        formCtx={formCtx}
        fieldName={fieldName}
        idPrefix={idPrefix}
        selectedRow={selectedRow}
        dialogRef={availabilityDialogRef}
      />
    ) : null

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

  const isSelectedRowVisible = useMemo(() => {
    if (!access) return true
    if (!editor.selectedFieldId) return false
    return visibleRows.some((row) => row.fieldId === editor.selectedFieldId)
  }, [access, editor.selectedFieldId, visibleRows])

  const countSupplement = access
    ? buildAvailabilityCountSupplement({
        scope,
        showUnavailable,
        hiddenUnavailableCount,
        layout: 'stable',
        onShow: showUnavailableItems,
        onHide: hideUnavailableItems,
      })
    : undefined

  const handleSelect = useCallback(
    (visibleIndex: number) => {
      const row = visibleRows[visibleIndex]
      if (row) editor.select(row.formIndex)
    },
    [editor, visibleRows],
  )

  const selectedVisibleIndex = useMemo(() => {
    if (!editor.selectedFieldId) return null
    const index = visibleRows.findIndex((row) => row.fieldId === editor.selectedFieldId)
    return index === -1 ? null : index
  }, [editor.selectedFieldId, visibleRows])

  const masterDetailGrid = (
    <MasterDetailGrid>
      <MasterDetailListPanel
        items={listItems}
        selectedIndex={selectedVisibleIndex}
        listTitle={listTitle}
        ariaLabel={ariaLabel}
        addLabel={addLabel}
        itemNoun={itemNoun}
        countSupplement={countSupplement}
        onAdd={editor.handleAdd}
        onSelect={handleSelect}
      />

      <MasterDetailEditorPanel
        editor={editor}
        itemFields={itemFields}
        fieldName={fieldName}
        idPrefix={idPrefix}
        itemNoun={itemNoun}
        showSelectedDetail={isSelectedRowVisible}
        selectedIdentity={selectedIdentity}
        showValidationBanner={showValidationBanner}
        campaignId={formCtx.campaignId}
        rowAvailability={selectedRowAvailability}
        availabilityFormItems={availabilityFormItems}
        availabilityNamePrefix={availabilityNamePrefix}
        availabilityDialogRef={availabilityDialogRef}
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
        {campaignAccessDialog}
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
