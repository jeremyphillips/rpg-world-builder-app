'use client'

import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type { ContentAccessTargetType, ContentTypeKey, WithCampaignAccess } from '@rpg/contracts'
import { FormFieldStack } from '@rpg/ui/form'

import {
  ActionDialogShell,
  CONTENT_AVAILABILITY_ACTION,
  formatActionBlockedDescription,
  formatActionBlockedTitle,
  useActionLifecycle,
  type ActionLifecycleCloseEvent,
} from '@/lib/actions'

import {
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
import { useBulkCampaignAccessAction } from './use-bulk-campaign-access-action.client'
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

  const targets = useMemo(
    () => selectedRows.map((row) => ({ targetId: row.id, targetName: row.name })),
    [selectedRows],
  )

  const { validate, apply, notifyClose, toLegacyResult } = useBulkCampaignAccessAction({
    campaignId,
    contentTypeKey,
    rows: selectedRows,
  })

  const pendingConfigRef = useRef<ReturnType<typeof toBulkCampaignAccessFormValues> | null>(null)

  const handleClose = useCallback(
    (
      event: ActionLifecycleCloseEvent<
        import('@rpg/contracts').ContentUsageBlocker,
        import('@rpg/contracts').ActionTargetFailure
      >,
    ) => {
      if (event.reason !== 'cancel') {
        notifyClose(event, pendingConfigRef.current)
        onApplyComplete(toLegacyResult(event.outcomes))
      }
      onOpenChange(false)
    },
    [notifyClose, onApplyComplete, onOpenChange, toLegacyResult],
  )

  const lifecycle = useActionLifecycle({
    open,
    targets,
    requiresValidation: true,
    validate,
    apply,
    onClose: handleClose,
  })

  useEffect(() => {
    if (!open) {
      form.reset(BULK_CAMPAIGN_ACCESS_FORM_FIELD_DEFAULTS)
    }
  }, [form, open])

  const handleConfigureApply = useCallback(() => {
    const config = toBulkCampaignAccessFormValues(form.getValues())
    pendingConfigRef.current = config
    void lifecycle.startApply(config)
  }, [form, lifecycle])

  const blockedMode =
    lifecycle.blockedCount === selectedRows.length
      ? 'bulk-all'
      : lifecycle.blockedCount > 0
        ? 'bulk-partial'
        : 'single'

  const resolveDescription =
    lifecycle.phase === 'resolve' && lifecycle.blockedCount > 0
      ? formatActionBlockedDescription({
          blockedCount: lifecycle.blockedCount,
          selectedCount: preview.wouldChangeCount,
          noun: 'item',
          referenceNoun: 'character',
        })
      : undefined

  const description =
    lifecycle.phase === 'resolve' && resolveDescription
      ? resolveDescription
      : formatBulkCampaignAccessDialogDescription(selectedRows.length, itemLabelPlural)

  return (
    <ActionDialogShell
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          lifecycle.cancel()
        } else {
          onOpenChange(nextOpen)
        }
      }}
      phase={lifecycle.phase}
      pending={lifecycle.pending}
      headline={
        lifecycle.phase === 'resolve' && lifecycle.blockedCount > 0
          ? formatActionBlockedTitle({ mode: blockedMode, action: CONTENT_AVAILABILITY_ACTION })
          : BULK_CAMPAIGN_ACCESS_DIALOG_HEADLINE
      }
      description={description}
      campaignId={campaignId}
      configureSlot={
        <FormProvider {...form}>
          <FormFieldStack fields={fields} idPrefix={formId} size="md" rhythm="comfortable" />
        </FormProvider>
      }
      summarySlot={
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>{formatBulkCampaignAccessSelectedCount(preview.selectedCount)}</p>
          <p>
            {formatBulkCampaignAccessChangePreview(
              preview.wouldChangeCount,
              preview.unchangedCount,
            )}
          </p>
          <p>{BULK_CAMPAIGN_ACCESS_DRAFT_NOTE}</p>
        </div>
      }
      localError={lifecycle.localError}
      resolutionRows={lifecycle.resolutionRows}
      resolutionLegend="Apply to"
      confirmedCount={lifecycle.confirmedCount}
      resolveNoun="items"
      onCheckedChange={lifecycle.toggleConfirmedTarget}
      onConfigureApply={handleConfigureApply}
      configureApplyDisabled={!preview.hasChanges || preview.wouldChangeCount === 0}
      onResolveConfirm={() => void lifecycle.confirmResolve()}
      onResolveBack={lifecycle.goBackToConfigure}
      onRetryFailed={() => void lifecycle.retryFailed()}
      onCancel={lifecycle.cancel}
      onAcceptMixedResult={lifecycle.acceptMixedResult}
    />
  )
}
