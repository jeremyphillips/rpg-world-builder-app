'use client'

import { useCallback, useState } from 'react'
import type {
  ContentUsageBlocker,
  VocabularyOptionSetId,
  VocabularyOptionWithUsage,
} from '@rpg/contracts'

import { ContentFormDrawer } from '@/features/content'
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
      <ContentFormDrawer
        open={props.open}
        onOpenChange={props.onOpenChange}
        title={sheet.headline}
        description={sheet.isEdit ? undefined : 'Custom entries appear as Custom in this campaign.'}
        pending={props.isPending}
        submitLabel={sheet.isEdit ? 'Save' : 'Create'}
        form={{
          schema: sheet.schema,
          fields: sheet.fields,
          defaultValues: sheet.defaultValues,
          formKey: sheet.formKey,
        }}
        onSubmit={(values) => {
          void sheet.handleSubmit(values)
        }}
      />

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
