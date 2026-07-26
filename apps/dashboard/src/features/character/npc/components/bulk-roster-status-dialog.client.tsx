'use client'

import { useEffect, useId, useMemo } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type { NpcCharacter } from '@rpg/contracts'
import { Button, Modal, Text } from '@rpg/ui'
import { FormFieldStack } from '@rpg/ui/form'

import {
  BULK_ROSTER_STATUS_FORM_FIELD_DEFAULTS,
  buildBulkRosterStatusFields,
  type BulkRosterStatusFormFieldValues,
} from '../lib/bulk/build-bulk-roster-status-fields'
import {
  resolveBulkRosterStatusPreview,
  toBulkRosterStatusFormValues,
} from '../lib/bulk/resolve-bulk-roster-status-preview'
import { useBulkUpdateNpcRosterStatus } from '../hooks/use-bulk-update-npc-roster-status'

export type BulkRosterStatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  selectedRows: NpcCharacter[]
  onApplyComplete: (result: { updatedIds: string[]; fullSuccess: boolean }) => void
}

export function BulkRosterStatusDialog({
  open,
  onOpenChange,
  campaignId,
  selectedRows,
  onApplyComplete,
}: BulkRosterStatusDialogProps) {
  const formId = useId()
  const fields = useMemo(() => buildBulkRosterStatusFields(), [])
  const form = useForm<BulkRosterStatusFormFieldValues>({
    defaultValues: BULK_ROSTER_STATUS_FORM_FIELD_DEFAULTS,
  })
  const fieldValues = useWatch({ control: form.control }) as BulkRosterStatusFormFieldValues
  const preview = useMemo(
    () =>
      resolveBulkRosterStatusPreview(
        selectedRows,
        fieldValues ?? BULK_ROSTER_STATUS_FORM_FIELD_DEFAULTS,
      ),
    [fieldValues, selectedRows],
  )
  const { apply, pending, resultSummary } = useBulkUpdateNpcRosterStatus({ campaignId })

  useEffect(() => {
    if (!open) {
      form.reset(BULK_ROSTER_STATUS_FORM_FIELD_DEFAULTS)
    }
  }, [form, open])

  const handleApply = async () => {
    const values = form.getValues()
    const bulkValues = toBulkRosterStatusFormValues(values)
    const result = await apply(selectedRows, bulkValues)
    onApplyComplete(result)

    if (result.fullSuccess) {
      onOpenChange(false)
    }
  }

  const handleOpenAutoFocus = (event: Event) => {
    event.preventDefault()
    const content = event.currentTarget as HTMLElement
    const firstField = content.querySelector<HTMLElement>('[role="combobox"], select, input')
    firstField?.focus()
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content
        size="md"
        aria-busy={pending || undefined}
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <Modal.Header
          headline="Edit roster status"
          description={`Apply roster status changes to ${selectedRows.length} selected NPC${selectedRows.length === 1 ? '' : 's'}.`}
        />
        <Modal.Body>
          <FormProvider {...form}>
            <FormFieldStack fields={fields} idPrefix={formId} size="md" rhythm="comfortable">
              <div className="mt-6 space-y-1 text-sm text-muted-foreground">
                <p>
                  {preview.wouldChangeCount} will change, {preview.unchangedCount} already match.
                </p>
                {resultSummary ? <Text variant="info">{resultSummary}</Text> : null}
              </div>
            </FormFieldStack>
          </FormProvider>
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
            disabled={!preview.hasChanges || preview.wouldChangeCount === 0 || pending}
            onClick={() => void handleApply()}
          >
            Apply changes
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
