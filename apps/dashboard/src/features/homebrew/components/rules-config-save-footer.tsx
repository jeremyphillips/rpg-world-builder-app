'use client'

import { FormSaveFooter } from '@rpg/ui/form'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

import { FormUnsavedChangesGuard } from '@/lib/form-unsaved-changes-guard'

type RulesConfigSaveFooterProps = {
  pending: boolean
  isSuccess: boolean
}

/** Shared save footer for Homebrew rules configuration forms. */
export function createRulesConfigSaveFooter({ pending, isSuccess }: RulesConfigSaveFooterProps) {
  return function RulesConfigSaveFooter<TFieldValues extends FieldValues>(
    form: UseFormReturn<TFieldValues>,
  ) {
    return (
      <>
        <FormUnsavedChangesGuard />
        <FormSaveFooter
          pending={pending || form.formState.isSubmitting}
          isSuccess={isSuccess}
          submitLabel="Save changes"
          successMessage="Changes saved."
        />
      </>
    )
  }
}
