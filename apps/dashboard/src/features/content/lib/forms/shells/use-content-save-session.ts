'use client'

import { useCallback, useRef } from 'react'
import { useFormState, type FieldValues, type UseFormReturn } from 'react-hook-form'
import { useSchemaFormSubmit } from '@rpg/ui/form'

import { hasDirtyFields } from '@/lib/form-dirty-state'

import {
  useCampaignAccessForm,
  type CampaignAccessSaveResult,
} from '../../campaign-access/campaign-access-form-context.client'
import {
  mapCampaignAccessSaveResult,
  runContentSaveSession,
  type SaveResult,
} from './content-save-session.lib'

export type ContentSaveActionState = {
  hasUnsavedEdits: boolean
  submitDisabled: boolean
  discardDisabled: boolean
  save: () => Promise<void>
  discard: () => void
}

export interface UseContentSaveSessionOptions<TFieldValues extends FieldValues> {
  mode: 'create' | 'edit'
  pending: boolean
  readOnly?: boolean
  form: UseFormReturn<TFieldValues>
  onSubmit: (values: TFieldValues, form: UseFormReturn<TFieldValues>) => Promise<void>
}

function mapAccessSaveResult(result: CampaignAccessSaveResult): SaveResult {
  return mapCampaignAccessSaveResult(result)
}

export function useContentSaveSession<TFieldValues extends FieldValues>({
  mode,
  pending,
  readOnly = false,
  form,
  onSubmit,
}: UseContentSaveSessionOptions<TFieldValues>): ContentSaveActionState {
  const campaignAccess = useCampaignAccessForm()
  const { dirtyFields, isSubmitting } = useFormState({ control: form.control })
  const bodyDirty = hasDirtyFields(dirtyFields)
  const schemaFormSubmit = useSchemaFormSubmit<TFieldValues>()
  const inFlightRef = useRef(false)

  const hasUnsavedEdits =
    mode === 'edit' ? bodyDirty || campaignAccess.isDirty : campaignAccess.isDirty
  const anyPending = pending || campaignAccess.isPending || isSubmitting

  const discard = useCallback(() => {
    if (bodyDirty) {
      form.reset()
    }
    if (campaignAccess.isDirty) {
      campaignAccess.reset()
    }
  }, [bodyDirty, campaignAccess, form])

  const save = useCallback(async () => {
    if (mode !== 'edit' || inFlightRef.current || anyPending) {
      return
    }

    inFlightRef.current = true
    try {
      await runContentSaveSession(
        {
          dirty: campaignAccess.isDirty,
          save: async () => mapAccessSaveResult(await campaignAccess.save()),
        },
        {
          dirty: bodyDirty,
          save: async () => {
            if (!schemaFormSubmit) {
              return {
                status: 'failed',
                error: new Error('Form submit context is unavailable.'),
              }
            }

            return new Promise<SaveResult>((resolve) => {
              schemaFormSubmit.requestSubmit(async (values, submitForm) => {
                try {
                  await onSubmit(values, submitForm)
                  resolve({ status: 'saved' })
                } catch (err) {
                  resolve({
                    status: 'failed',
                    error: err instanceof Error ? err : new Error(String(err)),
                  })
                }
              })
            })
          },
        },
      )
    } finally {
      inFlightRef.current = false
    }
  }, [anyPending, bodyDirty, campaignAccess, mode, onSubmit, schemaFormSubmit])

  if (mode === 'create') {
    return {
      hasUnsavedEdits,
      submitDisabled: pending || readOnly,
      discardDisabled: pending,
      save: async () => {},
      discard: () => {},
    }
  }

  return {
    hasUnsavedEdits,
    submitDisabled: anyPending || readOnly || !hasUnsavedEdits,
    discardDisabled: anyPending || readOnly || !hasUnsavedEdits,
    save,
    discard,
  }
}
