'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useFormState, type FieldValues, type UseFormReturn } from 'react-hook-form'
import { useSchemaFormSubmit } from '@rpg/ui/form'

import { hasDirtyFields } from '@/lib/form-dirty-state'

import { useCampaignAccessForm } from '../../../campaign-access/campaign-access-form-context.client'
import {
  runCoordinatedContentSave,
  type CoordinatedSaveSavedEvent,
  type SaveResult,
} from './content-save-session.lib'

export type { CoordinatedSaveSavedEvent } from './content-save-session.lib'

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
  /** Called once after the full coordinated save session succeeds. */
  onSaved?: (event: CoordinatedSaveSavedEvent) => void
}

export function useContentSaveSession<TFieldValues extends FieldValues>({
  mode,
  pending,
  readOnly = false,
  form,
  onSubmit,
  onSaved,
}: UseContentSaveSessionOptions<TFieldValues>): ContentSaveActionState {
  const campaignAccess = useCampaignAccessForm()
  const { dirtyFields, isSubmitting } = useFormState({ control: form.control })
  const bodyDirty = hasDirtyFields(dirtyFields)
  const schemaFormSubmit = useSchemaFormSubmit<TFieldValues>()
  const inFlightRef = useRef(false)
  const onSavedRef = useRef(onSaved)

  useEffect(() => {
    onSavedRef.current = onSaved
  })

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

    const accessWasDirty = campaignAccess.isDirty
    const bodyWasDirty = bodyDirty

    inFlightRef.current = true
    try {
      const result = await runCoordinatedContentSave({
        accessWasDirty,
        bodyWasDirty,
        readPendingAvailable: campaignAccess.readPendingAvailable,
        readAccessAvailabilityChanged: campaignAccess.readAccessAvailabilityChanged,
        access: {
          save: () => campaignAccess.save(),
        },
        body: {
          save: async () => {
            if (!schemaFormSubmit) {
              return {
                status: 'failed',
                error: new Error('Form submit context is unavailable.'),
              } satisfies SaveResult
            }

            return new Promise<SaveResult>((resolve) => {
              schemaFormSubmit.requestSubmit(
                async (values, submitForm) => {
                  try {
                    await onSubmit(values, submitForm)
                    resolve({ status: 'saved' })
                  } catch (err) {
                    resolve({
                      status: 'failed',
                      error: err instanceof Error ? err : new Error(String(err)),
                    })
                  }
                },
                () => resolve({ status: 'invalid' }),
              )
            })
          },
        },
      })

      if (result.status === 'saved') {
        onSavedRef.current?.(result.saved)
      }
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
