'use client'

import { useCallback, useState } from 'react'
import type {
  ContentUsageBlocker,
  VocabularyOptionSetId,
  VocabularyOptionWithUsage,
} from '@rpg/contracts'
import { Button, Sheet } from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import type { VocabularyEntryFormValues } from '@/features/vocabulary'
import { VocabularyAvailabilityBlockedDialog } from './vocabulary-availability-blocked-dialog.client'
import { useVocabularyEntrySheet } from './use-vocabulary-entry-sheet.client'

export type { VocabularyEntryFormValues } from '@/features/vocabulary'

type VocabularyEntrySheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  campaignId: string
  setId: VocabularyOptionSetId
  createHeadline: string
  entry?: VocabularyOptionWithUsage
  isPending: boolean
  onSubmit: (values: VocabularyEntryFormValues) => void | Promise<void>
}

function VocabularyEntrySheetFooter({
  isEdit,
  isPending,
}: {
  isEdit: boolean
  isPending: boolean
}) {
  return (
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
  )
}

/** Add/edit vocabulary entry form in a side sheet. */
export function VocabularyEntrySheet(props: VocabularyEntrySheetProps) {
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockers, setBlockers] = useState<ContentUsageBlocker[]>([])

  const handleBlocked = useCallback((nextBlockers: ContentUsageBlocker[]) => {
    setBlockers(nextBlockers)
    setBlockedOpen(true)
  }, [])

  const sheet = useVocabularyEntrySheet({
    ...props,
    onBlocked: handleBlocked,
  })

  return (
    <>
      <Sheet.Root open={props.open} onOpenChange={props.onOpenChange}>
        <Sheet.Content {...(sheet.isEdit ? { 'aria-describedby': undefined } : {})}>
          <Sheet.Header
            headline={sheet.headline}
            description={
              sheet.isEdit ? undefined : 'Custom entries appear as Custom in this campaign.'
            }
          />
          {props.open ? (
            <Sheet.Body className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
              <Form
                key={sheet.formKey}
                id="vocabulary-entry"
                schema={sheet.schema}
                fields={sheet.fields}
                defaultValues={sheet.defaultValues}
                contentClassName="px-6 pt-0"
                rhythm="comfortable"
                size="md"
                stickyFooter
                footerVariant="sheet"
                onSubmit={(values) => {
                  void sheet.handleSubmit(values)
                }}
                footer={() => (
                  <VocabularyEntrySheetFooter isEdit={sheet.isEdit} isPending={props.isPending} />
                )}
              />
            </Sheet.Body>
          ) : null}
        </Sheet.Content>
      </Sheet.Root>

      <VocabularyAvailabilityBlockedDialog
        open={blockedOpen}
        onOpenChange={setBlockedOpen}
        campaignId={props.campaignId}
        targetName={props.mode === 'edit' && props.entry ? props.entry.label : undefined}
        blockers={blockers}
      />
    </>
  )
}
