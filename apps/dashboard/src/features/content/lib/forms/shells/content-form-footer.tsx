'use client'

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import type { UseFormReturn, FieldValues } from 'react-hook-form'
import { Button } from '@rpg/ui'
import { FormFooterActions } from '@rpg/ui/form'

import { FormUnsavedChangesGuard } from '@/lib/form-unsaved-changes-guard'

const DISCARD_CHANGES_LABEL = 'Discard changes'
const CANCEL_LABEL = 'Cancel'
const SAVE_CHANGES_LABEL = 'Save changes'
const SAVING_LABEL = 'Saving…'
const CHANGES_SAVED_MESSAGE = 'Changes saved.'

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

export interface ContentFormFooterProps<TFieldValues extends FieldValues> {
  mode: 'create' | 'edit'
  form: UseFormReturn<TFieldValues>
  backHref?: string
  submitLabel: string
  pendingLabel?: string
  pending: boolean
  isSuccess?: boolean
}

export function ContentFormFooter<TFieldValues extends FieldValues>({
  mode,
  form,
  backHref,
  submitLabel,
  pendingLabel = mode === 'create' ? 'Creating…' : SAVING_LABEL,
  pending,
  isSuccess = false,
}: ContentFormFooterProps<TFieldValues>) {
  const { isDirty, isValid } = form.formState

  React.useEffect(() => {
    if (mode === 'create') {
      void form.trigger()
    }
  }, [form, mode])

  const submitDisabled = mode === 'create' ? !isValid : !isDirty || !isValid

  const secondary =
    mode === 'create' ? (
      <CreateCancelButton backHref={backHref} pending={pending} />
    ) : (
      <Button
        type="button"
        variant="outline"
        disabled={!isDirty || pending}
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
        isSuccess={mode === 'edit' && isSuccess}
        submitLabel={mode === 'edit' ? SAVE_CHANGES_LABEL : submitLabel}
        pendingLabel={pendingLabel}
        successMessage={mode === 'edit' ? CHANGES_SAVED_MESSAGE : undefined}
      />
    </>
  )
}
