'use client'

import { useFormState } from 'react-hook-form'

import { hasDirtyFields } from '@/lib/form-dirty-state'

export interface UseContentFormActionStateOptions {
  mode: 'create' | 'edit'
  pending: boolean
  readOnly?: boolean
}

export interface ContentFormActionState {
  submitDisabled: boolean
  discardDisabled: boolean
  hasUnsavedEdits: boolean
}

/** Catalog create/edit footer enablement — create pending-only; edit dirtyFields only. */
export function useContentFormActionState({
  mode,
  pending,
  readOnly = false,
}: UseContentFormActionStateOptions): ContentFormActionState {
  const { dirtyFields } = useFormState()
  const hasUnsavedEdits = hasDirtyFields(dirtyFields)

  if (mode === 'create') {
    return {
      submitDisabled: pending || readOnly,
      discardDisabled: pending,
      hasUnsavedEdits: false,
    }
  }

  return {
    submitDisabled: pending || readOnly || !hasUnsavedEdits,
    discardDisabled: pending || readOnly || !hasUnsavedEdits,
    hasUnsavedEdits,
  }
}
