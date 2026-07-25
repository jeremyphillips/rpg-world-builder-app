'use client'

import { useEffect, useId, useMemo, useRef } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type { ContentAccessTargetType, ContentTypeKey, WithCampaignAccess } from '@rpg/contracts'
import { Button, Modal, Text } from '@rpg/ui'
import { FormFieldStack } from '@rpg/ui/form'

import { CampaignAccessBlockedDialog } from '../campaign-access-blocked-dialog.client'
import {
  BULK_CAMPAIGN_ACCESS_APPLY_LABEL,
  BULK_CAMPAIGN_ACCESS_BLOCKED_PREVIEW_NOTE,
  BULK_CAMPAIGN_ACCESS_DIALOG_HEADLINE,
  BULK_CAMPAIGN_ACCESS_DRAFT_NOTE,
  formatBulkCampaignAccessChangePreview,
  formatBulkCampaignAccessDialogDescription,
  formatBulkCampaignAccessSelectedCount,
} from '../campaign-access-labels'
import {
  BULK_CAMPAIGN_ACCESS_FORM_FIELD_DEFAULTS,
  buildBulkCampaignAccessFields,
  type BulkCampaignAccessFormFieldValues,
} from './build-bulk-campaign-access-fields'
import {
  resolveBulkCampaignAccessPreview,
  toBulkCampaignAccessFormValues,
} from './resolve-bulk-campaign-access-preview'
import { useBulkUpdateCampaignAccess } from './use-bulk-update-campaign-access'
import type { ContentBase } from '../../overview/content-table-config'

export type BulkCampaignAccessDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  targetType: ContentAccessTargetType
  contentTypeKey: ContentTypeKey
  itemLabelPlural: string
  selectedRows: Array<WithCampaignAccess<ContentBase & { id: string }>>
  onApplyComplete: (result: {
    updatedIds: string[]
    blockedIds: string[]
    failedIds: string[]
    fullSuccess: boolean
  }) => void
}

export function BulkCampaignAccessDialog({
  open,
  onOpenChange,
  campaignId,
  targetType,
  contentTypeKey,
  itemLabelPlural,
  selectedRows,
  onApplyComplete,
}: BulkCampaignAccessDialogProps) {
  const formId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const fields = useMemo(() => buildBulkCampaignAccessFields(targetType), [targetType])
  const form = useForm<BulkCampaignAccessFormFieldValues>({
    defaultValues: BULK_CAMPAIGN_ACCESS_FORM_FIELD_DEFAULTS,
  })
  const fieldValues = useWatch({ control: form.control }) as BulkCampaignAccessFormFieldValues
  const preview = useMemo(
    () =>
      resolveBulkCampaignAccessPreview(
        selectedRows,
        fieldValues ?? BULK_CAMPAIGN_ACCESS_FORM_FIELD_DEFAULTS,
      ),
    [fieldValues, selectedRows],
  )
  const { apply, pending, resultSummary, blockedOpen, blockers, setBlockedOpen } =
    useBulkUpdateCampaignAccess({
      campaignId,
      contentTypeKey,
    })

  useEffect(() => {
    if (!open) {
      form.reset(BULK_CAMPAIGN_ACCESS_FORM_FIELD_DEFAULTS)
    }
  }, [form, open])

  const handleApply = async () => {
    const values = form.getValues()
    const bulkValues = toBulkCampaignAccessFormValues(values)
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
    <>
      <Modal.Root open={open} onOpenChange={onOpenChange}>
        <Modal.Content
          size="md"
          aria-busy={pending || undefined}
          onOpenAutoFocus={handleOpenAutoFocus}
        >
          <Modal.Header
            headline={BULK_CAMPAIGN_ACCESS_DIALOG_HEADLINE}
            description={formatBulkCampaignAccessDialogDescription(
              selectedRows.length,
              itemLabelPlural,
            )}
          />

          <Modal.Body>
            <FormProvider {...form}>
              <FormFieldStack fields={fields} idPrefix={formId} size="md" rhythm="comfortable">
                <div className="mt-6 space-y-1 text-sm text-muted-foreground">
                  <p>{formatBulkCampaignAccessSelectedCount(preview.selectedCount)}</p>
                  <p>
                    {formatBulkCampaignAccessChangePreview(
                      preview.wouldChangeCount,
                      preview.unchangedCount,
                    )}
                  </p>
                  <p>{BULK_CAMPAIGN_ACCESS_DRAFT_NOTE}</p>
                  <p>{BULK_CAMPAIGN_ACCESS_BLOCKED_PREVIEW_NOTE}</p>
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
              ref={triggerRef}
              type="button"
              disabled={pending || !preview.hasChanges}
              onClick={() => void handleApply()}
            >
              {BULK_CAMPAIGN_ACCESS_APPLY_LABEL}
            </Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      <CampaignAccessBlockedDialog
        open={blockedOpen}
        onOpenChange={setBlockedOpen}
        blockers={blockers}
      />
    </>
  )
}
