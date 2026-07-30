'use client'

import { FormSaveFooter } from '@rpg/ui/form'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

import { FormUnsavedChangesGuard } from '@/lib/form-unsaved-changes-guard'

type RulesConfigSaveFooterProps = {
  pending: boolean
}

/** Shared save footer for Homebrew rules configuration forms. */
export function createRulesConfigSaveFooter({ pending }: RulesConfigSaveFooterProps) {
  return function RulesConfigSaveFooter<TFieldValues extends FieldValues>(
    form: UseFormReturn<TFieldValues>,
  ) {
    return (
      <>
        <FormUnsavedChangesGuard />
        <FormSaveFooter
          pending={pending || form.formState.isSubmitting}
          submitLabel="Save changes"
        />
      </>
    )
  }
}
