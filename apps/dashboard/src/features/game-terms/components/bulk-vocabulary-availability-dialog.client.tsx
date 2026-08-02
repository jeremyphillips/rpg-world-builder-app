'use client'

import { useCallback, useEffect, useId, useMemo } from 'react'
import type { VocabularyOptionSetId, VocabularyOptionStatus } from '@rpg/contracts'
import { Button, Modal } from '@rpg/ui'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { FormFieldStack } from '@rpg/ui/form'
import type { VocabularyOptionWithUsage } from '@rpg/contracts'

import { VocabularyAvailabilityBlockedDialog } from './vocabulary-availability-blocked-dialog.client'
import { useBulkUpdateVocabularyAvailability } from '../lib/vocabulary/bulk/use-bulk-update-vocabulary-availability.client'
import type { BulkVocabularyAvailabilityApplyResult } from '../lib/vocabulary/bulk/bulk-apply-vocabulary-availability.lib'
import {
  VOCABULARY_BULK_AVAILABILITY_DIALOG_HEADLINE,
  VOCABULARY_STATUS_LABELS,
} from '@/features/vocabulary'

const STATUS_OPTIONS = (['active', 'disabled'] as const).map((value) => ({
  value,
  label: VOCABULARY_STATUS_LABELS[value],
}))

type BulkVocabularyAvailabilityFormValues = {
  status: VocabularyOptionStatus
}

export type BulkVocabularyAvailabilityDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  setId: VocabularyOptionSetId
  selectedRows: VocabularyOptionWithUsage[]
  onApplyComplete: (result: BulkVocabularyAvailabilityApplyResult) => void
}

export function BulkVocabularyAvailabilityDialog({
  open,
  onOpenChange,
  campaignId,
  setId,
  selectedRows,
  onApplyComplete,
}: BulkVocabularyAvailabilityDialogProps) {
  const formId = useId()
  const form = useForm<BulkVocabularyAvailabilityFormValues>({
    defaultValues: { status: 'active' },
  })
  const status = useWatch({ control: form.control, name: 'status' })
  const { apply, pending, blockedOpen, blockedResults, setBlockedOpen } =
    useBulkUpdateVocabularyAvailability({ campaignId, setId })

  useEffect(() => {
    if (!open) {
      form.reset({ status: 'active' })
    }
  }, [form, open])

  const previewCount = useMemo(
    () => selectedRows.filter((row) => row.status !== status).length,
    [selectedRows, status],
  )

  const handleApply = useCallback(async () => {
    const result = await apply(selectedRows, status ?? 'active')
    onApplyComplete(result)
    onOpenChange(false)
  }, [apply, onApplyComplete, onOpenChange, selectedRows, status])

  const handleOpenAutoFocus = (event: Event) => {
    event.preventDefault()
    const content = event.currentTarget as HTMLElement
    const firstField = content.querySelector<HTMLElement>('[role="combobox"], select, input')
    firstField?.focus()
  }

  return (
    <>
      <Modal.Root open={open} onOpenChange={onOpenChange}>
        <Modal.Content
          size="sm"
          aria-busy={pending || undefined}
          onOpenAutoFocus={handleOpenAutoFocus}
        >
          <Modal.Header
            headline={VOCABULARY_BULK_AVAILABILITY_DIALOG_HEADLINE}
            description={`Apply a new availability status to ${selectedRows.length} selected ${
              selectedRows.length === 1 ? 'entry' : 'entries'
            }.`}
          />

          <Modal.Body>
            <FormProvider {...form}>
              <FormFieldStack
                fields={[
                  {
                    type: 'select',
                    name: 'status',
                    label: 'Availability',
                    options: STATUS_OPTIONS,
                    required: true,
                  },
                ]}
                idPrefix={formId}
                size="md"
                rhythm="comfortable"
              />
            </FormProvider>
            <p className="mt-3 text-sm text-muted-foreground">
              {previewCount} {previewCount === 1 ? 'entry' : 'entries'} will change.
            </p>
          </Modal.Body>

          <Modal.Footer>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending || previewCount === 0}
              onClick={() => void handleApply()}
            >
              Apply
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      <VocabularyAvailabilityBlockedDialog
        open={blockedOpen}
        onOpenChange={setBlockedOpen}
        campaignId={campaignId}
        blockedResults={blockedResults}
      />
    </>
  )
}
