'use client'

import { useCallback, useId, useMemo, useState } from 'react'
import type { VocabularyOptionSetId, VocabularyOptionStatus } from '@rpg/contracts'
import { Button, Modal } from '@rpg/ui'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { FormFieldStack } from '@rpg/ui/form'
import type { VocabularyOptionWithUsage } from '@rpg/contracts'

import { updateVocabularyEntry } from '../api/vocabulary-api'
import { VOCABULARY_STATUS_LABELS } from '../lib/vocabulary/labels'

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
  onApplyComplete: (result: {
    updatedIds: string[]
    failedIds: string[]
    fullSuccess: boolean
  }) => void
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
  const [pending, setPending] = useState(false)
  const form = useForm<BulkVocabularyAvailabilityFormValues>({
    defaultValues: { status: 'active' },
  })
  const status = useWatch({ control: form.control, name: 'status' })

  const previewCount = useMemo(
    () => selectedRows.filter((row) => row.status !== status).length,
    [selectedRows, status],
  )

  const handleApply = useCallback(async () => {
    if (pending || previewCount === 0) {
      onApplyComplete({ updatedIds: [], failedIds: [], fullSuccess: true })
      return
    }

    setPending(true)
    const updatedIds: string[] = []
    const failedIds: string[] = []

    for (const row of selectedRows) {
      if (row.status === status) continue

      try {
        await updateVocabularyEntry(campaignId, setId, row.id, { status })
        updatedIds.push(row.id)
      } catch {
        failedIds.push(row.id)
      }
    }

    setPending(false)
    onApplyComplete({
      updatedIds,
      failedIds,
      fullSuccess: failedIds.length === 0,
    })
  }, [campaignId, onApplyComplete, pending, previewCount, selectedRows, setId, status])

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          headline="Edit availability"
          description={`Apply a new availability status to ${selectedRows.length} selected ${
            selectedRows.length === 1 ? 'entry' : 'entries'
          }.`}
        />

        <Modal.Body>
          <FormProvider {...form}>
            <form id={formId} onSubmit={(event) => event.preventDefault()}>
              <FormFieldStack
                idPrefix="bulk-vocabulary-availability"
                fields={[
                  {
                    type: 'select',
                    name: 'status',
                    label: 'Availability',
                    options: STATUS_OPTIONS,
                    required: true,
                  },
                ]}
              />
            </form>
          </FormProvider>
          <p className="mt-3 text-sm text-muted-foreground">
            {previewCount} {previewCount === 1 ? 'entry' : 'entries'} will change.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
  )
}
