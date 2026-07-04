'use client'

import { useMemo } from 'react'
import { Button, Sheet } from '@rpg/ui'
import { Form } from '@rpg/ui/form'
import type { VocabularyOptionWithUsage } from '@rpg/contracts'

import {
  vocabularyEntryCreateFields,
  vocabularyEntryCreateFormSchema,
  vocabularyEntryEditFields,
  vocabularyEntryEditFormSchema,
  type VocabularyEntryCreateFormValues,
  type VocabularyEntryEditFormValues,
  type VocabularyEntryFormValues,
} from '../lib/vocabulary/vocabulary-entry-form-fields'

export type { VocabularyEntryFormValues } from '../lib/vocabulary/vocabulary-entry-form-fields'

type VocabularyEntrySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  entry?: VocabularyOptionWithUsage
  isPending: boolean
  onSubmit: (values: VocabularyEntryFormValues) => void
}

/** Add/edit vocabulary entry form in a side sheet. */
export function VocabularyEntrySheet({
  open,
  onOpenChange,
  mode,
  entry,
  isPending,
  onSubmit,
}: VocabularyEntrySheetProps) {
  const isEdit = mode === 'edit'
  const headline = isEdit ? 'Edit vocabulary entry' : 'Add vocabulary entry'
  const formKey = isEdit && entry ? `edit-${entry.id}` : 'create'

  const schema = isEdit ? vocabularyEntryEditFormSchema : vocabularyEntryCreateFormSchema
  const fields = isEdit ? vocabularyEntryEditFields : vocabularyEntryCreateFields

  const defaultValues = useMemo(() => {
    if (isEdit && entry) {
      return {
        id: entry.id,
        label: entry.label,
        description: entry.description ?? '',
        status: entry.status,
      } satisfies VocabularyEntryEditFormValues
    }

    return {
      id: '',
      label: '',
      description: '',
    } satisfies VocabularyEntryCreateFormValues
  }, [entry, isEdit])

  return (
    <Sheet.Root open={open} onOpenChange={onOpenChange}>
      <Sheet.Content {...(isEdit ? { 'aria-describedby': undefined } : {})}>
        <Sheet.Header
          headline={headline}
          description={isEdit ? undefined : 'Custom entries appear as Custom in this campaign.'}
        />
        {open ? (
          <Form
            key={formKey}
            id="vocabulary-entry"
            schema={schema}
            fields={fields}
            defaultValues={defaultValues}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
            contentClassName="flex-1 overflow-y-auto p-6 pt-0"
            rhythm="compact"
            stickyFooter
            onSubmit={(values) => {
              if (isEdit) {
                const editValues = values as VocabularyEntryEditFormValues
                onSubmit({
                  id: editValues.id,
                  label: editValues.label,
                  description: editValues.description ?? '',
                  status: editValues.status,
                })
                return
              }

              const createValues = values as VocabularyEntryCreateFormValues
              onSubmit({
                id: createValues.id,
                label: createValues.label,
                description: createValues.description ?? '',
                status: 'active',
              })
            }}
            footer={() => (
              <div className="flex w-full items-center justify-end gap-2">
                <Sheet.Close asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </Sheet.Close>
                <Button type="submit" disabled={isPending}>
                  {isEdit ? 'Save' : 'Create'}
                </Button>
              </div>
            )}
          />
        ) : null}
      </Sheet.Content>
    </Sheet.Root>
  )
}
