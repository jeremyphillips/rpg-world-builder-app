import { useId, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { FieldPath } from 'react-hook-form'
import type { GeneralTable, ProgressionTable } from '@rpg/contracts'
import { Button, ConfirmDialog, DialogPanelScrollRegion, Modal } from '@rpg/ui'

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
  TABLE_BUILDER_KIND_NOT_ALLOWED,
  TABLE_BUILDER_MODAL_DESCRIPTION,
} from '../../lib/table-builder/table-builder-copy'
import {
  createEmptyTableBuilderDraft,
  draftToTable,
  tableToDraft,
  type TableBuilderFormValues,
} from '../../lib/table-builder/table-builder-draft'
import {
  draftToGeneralTable,
  generalTableToDraft,
} from '../../lib/table-builder/table-builder-general-draft'
import type { TableBuilderSavedTable } from '../../lib/table-builder/table-builder-kind'
import {
  assertTableBuilderHostConfig,
  resolveTableBuilderRecommendedKind,
  type TableBuilderHostConfig,
} from '../../lib/table-builder/table-builder-host-config'
import { resolveTableBuilderFormSchema } from '../../lib/table-builder/resolve-table-builder-form-schema'
import { TableBuilder } from './table-builder'
import { tableBuilderModalDeleteButtonClasses } from './table-builder-modal.variants'

export type TableBuilderModalMode = 'create' | 'edit'

export type TableBuilderModalProps = {
  open: boolean
  mode: TableBuilderModalMode
  config: TableBuilderHostConfig
  /** Existing table when editing; ignored for `create`. */
  value?: TableBuilderSavedTable
  /** Receives one schema-valid table; the parent owns persistence. */
  onSave?: (table: TableBuilderSavedTable) => void
  /** When set, receives the validated draft instead of a persisted table shape. */
  onSaveDraft?: (draft: TableBuilderFormValues) => void
  onOpenChange: (open: boolean) => void
  /** Optional initial draft — used by constrained hosts instead of `value`. */
  initialDraft?: TableBuilderFormValues
  /** When provided in edit mode, surfaces a confirmed destructive delete action. */
  onDelete?: () => void
}

function tableToDraftValues(
  config: TableBuilderHostConfig,
  value: TableBuilderSavedTable | undefined,
): TableBuilderFormValues {
  if (value === undefined) {
    return createEmptyTableBuilderDraft(resolveTableBuilderRecommendedKind(config))
  }
  return value.kind === 'general'
    ? generalTableToDraft(value as GeneralTable)
    : tableToDraft(value as ProgressionTable)
}

function draftToSavedTable(
  values: TableBuilderFormValues,
  existing: TableBuilderSavedTable | undefined,
): TableBuilderSavedTable {
  if (values.kind === 'general') {
    return draftToGeneralTable(values, existing ? { existingTable: existing as GeneralTable } : {})
  }
  return draftToTable(values, existing ? { existingTable: existing as ProgressionTable } : {})
}

/**
 * Focused authoring modal for structured tables. Owns an isolated draft form —
 * parent form state is never registered or mutated while editing; Save returns
 * a single validated table and Cancel discards the draft (with an
 * unsaved-changes guard).
 */
export function TableBuilderModal(props: TableBuilderModalProps) {
  if (!props.open) return null
  return <TableBuilderModalContent {...props} />
}

function TableBuilderModalContent({
  mode,
  config,
  value,
  initialDraft,
  onSave,
  onSaveDraft,
  onOpenChange,
  onDelete,
}: TableBuilderModalProps) {
  assertTableBuilderHostConfig(config)

  const formId = useId()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const form = useForm<TableBuilderFormValues>({
    resolver: zodResolver(resolveTableBuilderFormSchema(config)),
    defaultValues: initialDraft ?? tableToDraftValues(config, value),
    mode: 'onSubmit',
  })

  const unsavedChanges = useUnsavedChangesConfirm({ isDirty: form.formState.isDirty })

  const handleRequestClose = () => {
    unsavedChanges.request(() => onOpenChange(false))
  }

  const handleSubmit = form.handleSubmit((values) => {
    if (!config.allowedKinds.includes(values.kind)) {
      form.setError('kind', { type: 'manual', message: TABLE_BUILDER_KIND_NOT_ALLOWED })
      return
    }

    const draftValidation = config.validateDraftBeforeSave?.({ draft: values })
    if (draftValidation !== undefined && !draftValidation.valid) {
      draftValidation.errors.forEach(({ path, message }) => {
        form.setError(path as FieldPath<TableBuilderFormValues>, {
          type: 'manual',
          message,
        })
      })
      return
    }

    if (onSaveDraft) {
      onSaveDraft(values)
    } else if (onSave) {
      onSave(draftToSavedTable(values, value))
    }
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
          <Modal.Body stableBody>
            <DialogPanelScrollRegion inset="innerLeading">
              <form id={formId} onSubmit={handleSubmit} noValidate>
                <TableBuilder form={form} config={config} mode={mode} />
              </form>
            </DialogPanelScrollRegion>
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
