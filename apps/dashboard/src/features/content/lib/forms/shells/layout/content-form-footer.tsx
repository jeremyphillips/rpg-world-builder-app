'use client'

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UseFormReturn, FieldValues } from 'react-hook-form'
import { useFormState } from 'react-hook-form'
import { Button } from '@rpg/ui'
import { FormFooterActions, useSchemaFormSubmit } from '@rpg/ui/form'

import {
  FormUnsavedChangesGuard,
  useUnsavedChangesConfirm,
  type UnsavedChangesConfirmController,
} from '@/lib/form-unsaved-changes-guard'
import { composeFormLeaveDirty } from '@/lib/form-leave-dirty'
import { useSubclassUnsavedEditsBlocking } from '@/features/content/classes/hooks/subclass-unsaved-edits-context.client'

import { resolveContentFormFooterPresentation } from './content-form-footer.lib'
import { useContentFormActionState } from './use-content-form-action-state'
import type { ContentSaveActionState } from '../session/use-content-save-session'

const DISCARD_CHANGES_LABEL = 'Discard changes'
const CANCEL_LABEL = 'Cancel'
const SAVE_DRAFT_LABEL = 'Save draft'
const SAVING_DRAFT_LABEL = 'Saving draft…'
const SAVING_LABEL = 'Saving…'

function CreateCancelButton({ backHref, pending }: { backHref?: string; pending: boolean }) {
  const navigate = useNavigate()

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        if (backHref) navigate(backHref)
      }}
    >
      {CANCEL_LABEL}
    </Button>
  )
}

function ContentCreateFooterSecondary<TFieldValues extends FieldValues>({
  backHref,
  createPending,
  submitDisabled,
  saveDraftPending,
  onSaveDraft,
}: {
  backHref?: string
  createPending: boolean
  submitDisabled: boolean
  saveDraftPending: boolean
  onSaveDraft?: (values: TFieldValues, form: UseFormReturn<TFieldValues>) => void | Promise<void>
}) {
  const schemaFormSubmit = useSchemaFormSubmit<TFieldValues>()

  return (
    <>
      <CreateCancelButton backHref={backHref} pending={createPending} />
      {onSaveDraft ? (
        <Button
          type="button"
          variant="outline"
          disabled={submitDisabled || saveDraftPending}
          onClick={() => schemaFormSubmit?.requestSubmit(onSaveDraft)}
        >
          {saveDraftPending ? SAVING_DRAFT_LABEL : SAVE_DRAFT_LABEL}
        </Button>
      ) : null}
    </>
  )
}

export interface ContentFormFooterProps<TFieldValues extends FieldValues> {
  mode: 'create' | 'edit'
  form: UseFormReturn<TFieldValues>
  backHref?: string
  submitLabel: string
  pendingLabel?: string
  pending: boolean
  onSaveDraft?: (values: TFieldValues, form: UseFormReturn<TFieldValues>) => void | Promise<void>
  saveDraftPending?: boolean
  /** Unified save session for edit mode — body + campaign access. */
  actionState?: ContentSaveActionState
  /** Additive leave-guard extras (e.g. campaign access draft on create). */
  extraUnsavedEdits?: boolean
  /** Called when the leave-guard controller is ready — use `runTrusted` after successful create. */
  onLeaveGuardReady?: (guard: Pick<UnsavedChangesConfirmController, 'runTrusted'>) => void
}

export function ContentFormFooter<TFieldValues extends FieldValues>({
  mode,
  form,
  backHref,
  submitLabel,
  pendingLabel = mode === 'create' ? 'Publishing…' : SAVING_LABEL,
  pending,
  onSaveDraft,
  saveDraftPending = false,
  actionState,
  extraUnsavedEdits = false,
  onLeaveGuardReady,
}: ContentFormFooterProps<TFieldValues>) {
  const fallbackActionState = useContentFormActionState({ mode, pending })
  const resolvedActionState = actionState ?? fallbackActionState
  const createPending = pending || saveDraftPending
  const { dirtyFields } = useFormState({ control: form.control })
  const subclassEdits = useSubclassUnsavedEditsBlocking()
  const isDirty = composeFormLeaveDirty({ dirtyFields, extraUnsavedEdits, subclassEdits })
  const discardGuard = useUnsavedChangesConfirm({ isDirty })
  const leavePending = mode === 'create' ? createPending : pending

  useEffect(() => {
    onLeaveGuardReady?.({ runTrusted: discardGuard.runTrusted })
  }, [discardGuard.runTrusted, onLeaveGuardReady])

  const presentation = resolveContentFormFooterPresentation({
    mode,
    submitLabel,
    pendingLabel,
  })

  const secondary =
    mode === 'create' ? (
      <ContentCreateFooterSecondary
        backHref={backHref}
        createPending={createPending}
        submitDisabled={resolvedActionState.submitDisabled}
        saveDraftPending={saveDraftPending}
        onSaveDraft={onSaveDraft}
      />
    ) : (
      <Button
        type="button"
        variant="outline"
        disabled={resolvedActionState.discardDisabled}
        onClick={() => {
          if (actionState) {
            actionState.discard()
            return
          }
          form.reset()
        }}
      >
        {DISCARD_CHANGES_LABEL}
      </Button>
    )

  const submitButton =
    mode === 'edit' && actionState ? (
      <Button
        type="button"
        disabled={resolvedActionState.submitDisabled || pending}
        onClick={() => void actionState.save()}
      >
        {pending ? pendingLabel : submitLabel}
      </Button>
    ) : undefined

  return (
    <>
      {discardGuard.dialog}
      <FormUnsavedChangesGuard
        discardGuard={discardGuard}
        pending={leavePending}
        renderDialog={false}
      />
      <FormFooterActions
        secondary={secondary}
        pending={pending}
        submitDisabled={resolvedActionState.submitDisabled}
        secondaryDisabled={createPending}
        isSuccess={presentation.isSuccess}
        submitLabel={presentation.submitLabel}
        pendingLabel={presentation.pendingLabel}
        successMessage={presentation.successMessage}
        submitButton={submitButton}
      />
    </>
  )
}
