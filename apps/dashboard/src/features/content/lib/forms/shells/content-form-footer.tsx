'use client'

import { useNavigate } from 'react-router-dom'
import type { UseFormReturn, FieldValues } from 'react-hook-form'
import { Button } from '@rpg/ui'
import { FormFooterActions, useSchemaFormSubmit } from '@rpg/ui/form'

import { FormUnsavedChangesGuard } from '@/lib/form-unsaved-changes-guard'

import { resolveContentFormFooterPresentation } from './content-form-footer.lib'
import { useContentFormActionState } from './use-content-form-action-state'

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
  isSuccess?: boolean
  onSaveDraft?: (values: TFieldValues, form: UseFormReturn<TFieldValues>) => void | Promise<void>
  saveDraftPending?: boolean
  publishSuccess?: boolean
}

export function ContentFormFooter<TFieldValues extends FieldValues>({
  mode,
  form,
  backHref,
  submitLabel,
  pendingLabel = mode === 'create' ? 'Publishing…' : SAVING_LABEL,
  pending,
  isSuccess = false,
  onSaveDraft,
  saveDraftPending = false,
  publishSuccess = false,
}: ContentFormFooterProps<TFieldValues>) {
  const { submitDisabled, discardDisabled } = useContentFormActionState({ mode, pending })
  const createPending = pending || saveDraftPending
  const presentation = resolveContentFormFooterPresentation({
    mode,
    submitLabel,
    pendingLabel,
    isSuccess,
    publishSuccess,
  })

  const secondary =
    mode === 'create' ? (
      <ContentCreateFooterSecondary
        backHref={backHref}
        createPending={createPending}
        submitDisabled={submitDisabled}
        saveDraftPending={saveDraftPending}
        onSaveDraft={onSaveDraft}
      />
    ) : (
      <Button
        type="button"
        variant="outline"
        disabled={discardDisabled}
        onClick={() => form.reset()}
      >
        {DISCARD_CHANGES_LABEL}
      </Button>
    )

  return (
    <>
      <FormUnsavedChangesGuard />
      <FormFooterActions
        secondary={secondary}
        pending={pending}
        submitDisabled={submitDisabled}
        secondaryDisabled={createPending}
        isSuccess={presentation.isSuccess}
        submitLabel={presentation.submitLabel}
        pendingLabel={presentation.pendingLabel}
        successMessage={presentation.successMessage}
      />
    </>
  )
}
