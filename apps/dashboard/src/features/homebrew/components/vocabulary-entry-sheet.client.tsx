'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button, SelectField, Sheet, TextareaField, TextField } from '@rpg/ui'
import type { VocabularyOptionWithUsage } from '@rpg/contracts'

import { VOCABULARY_STATUS_LABELS } from '../lib/vocabulary-labels'

export type VocabularyEntryFormValues = {
  id: string
  label: string
  description: string
  status: 'active' | 'disabled'
}

type VocabularyEntrySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  entry?: VocabularyOptionWithUsage
  isPending: boolean
  onSubmit: (values: VocabularyEntryFormValues) => void
}

const STATUS_OPTIONS = (['active', 'disabled'] as const).map((status) => ({
  label: VOCABULARY_STATUS_LABELS[status],
  value: status,
}))

/** Add/edit vocabulary entry form in a side sheet. */
export function VocabularyEntrySheet({
  open,
  onOpenChange,
  mode,
  entry,
  isPending,
  onSubmit,
}: VocabularyEntrySheetProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<VocabularyEntryFormValues>({
    defaultValues: { id: '', label: '', description: '', status: 'active' },
  })

  const status = useWatch({ control, name: 'status' })

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && entry) {
      reset({
        id: entry.id,
        label: entry.label,
        description: entry.description ?? '',
        status: entry.status,
      })
      return
    }
    reset({ id: '', label: '', description: '', status: 'active' })
  }, [open, mode, entry, reset])

  const headline = mode === 'create' ? 'Add vocabulary entry' : 'Edit vocabulary entry'

  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange}>
      <Sheet.Content {...(mode === 'edit' ? { 'aria-describedby': undefined } : {})}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex h-full flex-col">
          <Sheet.Header
            headline={headline}
            description={
              mode === 'create' ? 'Custom entries appear as Custom in this campaign.' : undefined
            }
          />
          <Sheet.Body className="space-y-4">
            {mode === 'create' ? (
              <TextField
                id="vocabulary-entry-id"
                label="Id"
                hint="Lowercase slug, e.g. fey-kin"
                required
                {...register('id', { required: 'Id is required.' })}
                error={errors.id?.message}
              />
            ) : (
              <TextField id="vocabulary-entry-id" label="Id" value={entry?.id ?? ''} disabled />
            )}
            <TextField
              id="vocabulary-entry-label"
              label="Name"
              required
              {...register('label', { required: 'Name is required.' })}
              error={errors.label?.message}
            />
            <TextareaField
              id="vocabulary-entry-description"
              label="Description"
              {...register('description')}
            />
            {mode === 'edit' ? (
              <SelectField
                id="vocabulary-entry-status"
                label="Status"
                options={STATUS_OPTIONS}
                value={status}
                onValueChange={(value) =>
                  setValue('status', value as VocabularyEntryFormValues['status'], {
                    shouldDirty: true,
                  })
                }
              />
            ) : null}
          </Sheet.Body>
          <Sheet.Footer>
            <Sheet.Close asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </Sheet.Close>
            <Button type="submit" disabled={isPending}>
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </Sheet.Footer>
        </form>
      </Sheet.Content>
    </Sheet.Root>
  )
}
