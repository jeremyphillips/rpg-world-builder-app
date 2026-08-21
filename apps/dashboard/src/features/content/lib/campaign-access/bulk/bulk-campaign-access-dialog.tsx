import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type {
  ContentAccessTargetType,
  ContentTypeKey,
  WithCampaignAccess,
  ContentUsageBlocker,
  ActionTargetFailure,
} from '@rpg/contracts'
import { FormFieldStack } from '@rpg/ui/form'

import {
  ActionDialogShell,
  buildActionDialogNotify,
  deriveActionApplySummary,
  finalizeActionDialogCloseWithOutcomes,
  useActionLifecycle,
  type ActionApplySummary,
  type ActionLifecycleCloseEvent,
} from '@/lib/actions'

import { createBulkCampaignAccessDescriptor } from '../campaign-access-labels'
import {
  BULK_CAMPAIGN_ACCESS_FORM_FIELD_DEFAULTS,
  buildBulkCampaignAccessFields,
  type BulkCampaignAccessFormFieldValues,
} from './build-bulk-campaign-access-fields'
import { resolveBulkCampaignAccessDialogPresentation } from './resolve-bulk-campaign-access-dialog-presentation'
import {
  resolveBulkCampaignAccessPreview,
  toBulkCampaignAccessFormValues,
} from './resolve-bulk-campaign-access-preview'
import { useBulkCampaignAccessAction } from './use-bulk-campaign-access-action'
import { collectDistinctSourceKeysFromBlockedTargets } from '@/lib/usage-references/group-usage-blockers-by-source'
import type { ContentBase } from '../../overview/content-table-config'

export type BulkCampaignAccessDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  targetType: ContentAccessTargetType
  contentTypeKey: ContentTypeKey
  itemLabelPlural: string
  selectedRows: Array<WithCampaignAccess<ContentBase & { id: string }>>
  onApplyComplete: (result: ActionApplySummary) => void
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
  const descriptor = useMemo(
    () => createBulkCampaignAccessDescriptor(itemLabelPlural),
    [itemLabelPlural],
  )
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

  const closeGuardRef = useRef(false)
  const pendingConfigRef = useRef<ReturnType<typeof toBulkCampaignAccessFormValues> | null>(null)

  const { validate, apply, notifyClose } = useBulkCampaignAccessAction({
    campaignId,
    contentTypeKey,
    rows: selectedRows,
  })

  const handleClose = useCallback(
    (event: ActionLifecycleCloseEvent<ContentUsageBlocker, ActionTargetFailure>) => {
      const summary = deriveActionApplySummary(event.outcomes)

      finalizeActionDialogCloseWithOutcomes({
        onOpenChange,
        event,
        closedRef: closeGuardRef,
        syncOutcomes: () => {
          onApplyComplete(summary)
        },
        notify: buildActionDialogNotify({
          event,
          notify: () => notifyClose(event, pendingConfigRef.current),
        }),
      })
    },
    [notifyClose, onApplyComplete, onOpenChange],
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
    if (open) {
      closeGuardRef.current = false
      return
    }

    form.reset(BULK_CAMPAIGN_ACCESS_FORM_FIELD_DEFAULTS)
  }, [form, open])

  const handleConfigureApply = useCallback(() => {
    const config = toBulkCampaignAccessFormValues(form.getValues())
    pendingConfigRef.current = config
    void lifecycle.startApply(config)
  }, [form, lifecycle])

  const isResolvePhase = lifecycle.phase === 'resolve'
  const hasBlockers = isResolvePhase && lifecycle.blockedCount > 0
  const blockedSourceKeys = useMemo(
    () =>
      lifecycle.validationResult
        ? collectDistinctSourceKeysFromBlockedTargets(lifecycle.validationResult.targets)
        : [],
    [lifecycle.validationResult],
  )
  const presentation = resolveBulkCampaignAccessDialogPresentation({
    blockedCount: lifecycle.blockedCount,
    blockedSourceKeys,
    confirmedCount: lifecycle.confirmedCount,
    descriptor,
    hasBlockers,
    isResolvePhase,
    itemLabelPlural,
    preview,
    selectedCount: selectedRows.length,
  })

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
      headline={presentation.headline}
      description={presentation.description}
      useCustomResolveHeadline={presentation.useCustomResolveHeadline}
      campaignId={campaignId}
      configureSlot={
        <FormProvider {...form}>
          <FormFieldStack fields={fields} idPrefix={formId} density="compact" />
        </FormProvider>
      }
      summarySlot={presentation.summarySlot}
      localError={lifecycle.localError}
      resolutionRows={lifecycle.resolutionRows}
      resolutionLegend={presentation.resolutionLegend}
      confirmedCount={lifecycle.confirmedCount}
      resolveNoun={itemLabelPlural}
      onCheckedChange={lifecycle.toggleConfirmedTarget}
      onConfigureApply={handleConfigureApply}
      configureApplyDisabled={presentation.configureApplyDisabled}
      configureApplyLabel={presentation.configureApplyLabel}
      configureApplyHidden={presentation.configureApplyHidden}
      resolveApplyLabel={presentation.resolveApplyLabel}
      resolveApplyHidden={presentation.resolveApplyHidden}
      onResolveConfirm={() => void lifecycle.confirmResolve()}
      onResolveBack={lifecycle.goBackToConfigure}
      onRetryFailed={() => void lifecycle.retryFailed()}
      onCancel={lifecycle.cancel}
      onAcceptMixedResult={lifecycle.acceptMixedResult}
    />
  )
}
