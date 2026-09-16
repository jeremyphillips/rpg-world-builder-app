import { useId, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { ProgressionTable } from '@rpg/contracts'
import { Button, ConfirmDialog, Modal } from '@rpg/ui'

import { useUnsavedChangesConfirm } from '@/lib/use-unsaved-changes-confirm'

import {
  TABLE_BUILDER_CANCEL_LABEL,
  TABLE_BUILDER_CREATE_SUBMIT_LABEL,
  TABLE_BUILDER_CREATE_TITLE,
  TABLE_BUILDER_DELETE_CONFIRM_DESCRIPTION,
  TABLE_BUILDER_DELETE_CONFIRM_HEADLINE,
  TABLE_BUILDER_DELETE_CONFIRM_LABEL,
  TABLE_BUILDER_DELETE_LABEL,
  TABLE_BUILDER_EDIT_SUBMIT_LABEL,
  TABLE_BUILDER_EDIT_TITLE,
  TABLE_BUILDER_MODAL_DESCRIPTION,
} from '../../lib/table-builder/table-builder-copy'
import {
  createEmptyTableBuilderDraft,
  draftToTable,
  tableToDraft,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import { tableBuilderFormSchema } from '../../lib/table-builder/table-builder-form-schema'
import { TableBuilder } from './table-builder'
import { tableBuilderModalDeleteButtonClasses } from './table-builder-modal.variants'

export type TableBuilderModalMode = 'create' | 'edit'

export type TableBuilderModalProps = {
  open: boolean
  mode: TableBuilderModalMode
  /** Existing table when editing; ignored for `create`. */
  value?: ProgressionTable
  /** Semantic level set for the structural axis — derived by the consumer. */
  allowedLevels: readonly number[]
  /** Receives one schema-valid `ProgressionTable`; the parent owns persistence. */
  onSave: (table: ProgressionTable) => void
  onOpenChange: (open: boolean) => void
  /** When provided in edit mode, surfaces a confirmed destructive delete action. */
  onDelete?: () => void
}

/**
 * Focused authoring modal for structured tables. Owns an isolated draft form —
 * parent form state is never registered or mutated while editing; Save returns
 * a single validated `ProgressionTable` and Cancel discards the draft (with an
 * unsaved-changes guard).
 */
export function TableBuilderModal(props: TableBuilderModalProps) {
  // Remount the content per open so each session starts from a fresh draft.
  if (!props.open) return null
  return <TableBuilderModalContent {...props} />
}

function TableBuilderModalContent({
  mode,
  value,
  allowedLevels,
  onSave,
  onOpenChange,
  onDelete,
}: TableBuilderModalProps) {
  const formId = useId()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const form = useForm<TableBuilderFormValues>({
    resolver: zodResolver(tableBuilderFormSchema),
    defaultValues: value !== undefined ? tableToDraft(value) : createEmptyTableBuilderDraft(),
    mode: 'onSubmit',
  })

  const unsavedChanges = useUnsavedChangesConfirm({ isDirty: form.formState.isDirty })

  const handleRequestClose = () => {
    unsavedChanges.request(() => onOpenChange(false))
  }

  const handleSubmit = form.handleSubmit((values) => {
    onSave(draftToTable(values, value !== undefined ? { existingTable: value } : {}))
    onOpenChange(false)
  })

  const showDelete = mode === 'edit' && onDelete !== undefined

  return (
    <>
      <Modal.Root
        open
        onOpenChange={(nextOpen) => {
          if (!nextOpen) handleRequestClose()
        }}
      >
        <Modal.Content size="xl" layout="stable" stableSize="tall">
          <Modal.Header
            headline={mode === 'create' ? TABLE_BUILDER_CREATE_TITLE : TABLE_BUILDER_EDIT_TITLE}
            description={TABLE_BUILDER_MODAL_DESCRIPTION}
          />
          <Modal.Body>
            <form id={formId} onSubmit={handleSubmit} noValidate>
              <TableBuilder form={form} allowedLevels={allowedLevels} />
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Modal.FooterActions>
              {showDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  className={tableBuilderModalDeleteButtonClasses}
                  onClick={() => setConfirmingDelete(true)}
                >
                  <Trash2 className="size-4" aria-hidden />
                  {TABLE_BUILDER_DELETE_LABEL}
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={handleRequestClose}>
                {TABLE_BUILDER_CANCEL_LABEL}
              </Button>
              <Button type="submit" form={formId}>
                {mode === 'create'
                  ? TABLE_BUILDER_CREATE_SUBMIT_LABEL
                  : TABLE_BUILDER_EDIT_SUBMIT_LABEL}
              </Button>
            </Modal.FooterActions>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {unsavedChanges.dialog}

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        headline={TABLE_BUILDER_DELETE_CONFIRM_HEADLINE}
        description={TABLE_BUILDER_DELETE_CONFIRM_DESCRIPTION}
        confirmLabel={TABLE_BUILDER_DELETE_CONFIRM_LABEL}
        confirmVariant="destructive"
        onConfirm={() => {
          setConfirmingDelete(false)
          onDelete?.()
          onOpenChange(false)
        }}
      />
    </>
  )
}
