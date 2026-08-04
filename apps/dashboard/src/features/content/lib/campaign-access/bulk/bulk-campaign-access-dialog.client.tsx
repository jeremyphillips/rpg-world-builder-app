'use client'

import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type { ContentAccessTargetType, ContentTypeKey, WithCampaignAccess } from '@rpg/contracts'
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

import {
  BULK_CAMPAIGN_ACCESS_DIALOG_HEADLINE,
  BULK_CAMPAIGN_ACCESS_DRAFT_NOTE,
  createBulkCampaignAccessDescriptor,
  formatBulkCampaignAccessBlockedDescription,
  formatBulkCampaignAccessBlockedTitle,
  formatBulkCampaignAccessConfigureApplyLabel,
  formatBulkCampaignAccessConfigureSummary,
  formatBulkCampaignAccessDialogDescription,
  formatBulkCampaignAccessResolutionLegend,
  formatBulkCampaignAccessResolveApplyLabel,
  formatBulkCampaignAccessResolveTally,
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

  const { validate, apply, notifyClose } = useBulkCampaignAccessAction({
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
  const blockedMode =
    hasBlockers && lifecycle.confirmedCount === 0 && preview.wouldChangeCount > 0
      ? 'bulk-all'
      : 'bulk-partial'

  const configureSummary = formatBulkCampaignAccessConfigureSummary({
    wouldChangeCount: preview.wouldChangeCount,
    unchangedCount: preview.unchangedCount,
    unchangedReasons: preview.unchangedReasons,
    descriptor,
  })

  const blockedSourceKeys = useMemo(
    () =>
      lifecycle.validationResult
        ? collectDistinctSourceKeysFromBlockedTargets(lifecycle.validationResult.targets)
        : [],
    [lifecycle.validationResult],
  )

  const resolveDescription = hasBlockers
    ? formatBulkCampaignAccessBlockedDescription({
        mode: blockedMode,
        blockedCount: lifecycle.blockedCount,
        wouldChangeCount: preview.wouldChangeCount,
        eligibleCount: lifecycle.confirmedCount,
        descriptor,
        sourceKeys: blockedSourceKeys,
      })
    : undefined

  const resolveTally = hasBlockers
    ? formatBulkCampaignAccessResolveTally({
        readyCount: lifecycle.confirmedCount,
        blockedCount: lifecycle.blockedCount,
        unchangedCount: preview.unchangedCount,
        unchangedReasons: preview.unchangedReasons,
        descriptor,
      })
    : undefined

  const description =
    isResolvePhase && resolveDescription
      ? resolveDescription
      : formatBulkCampaignAccessDialogDescription(selectedRows.length, itemLabelPlural)

  const configureApplyLabel = formatBulkCampaignAccessConfigureApplyLabel({
    wouldChangeCount: preview.wouldChangeCount,
    descriptor,
  })

  const resolveApplyLabel = formatBulkCampaignAccessResolveApplyLabel({
    confirmedCount: lifecycle.confirmedCount,
    descriptor,
  })

  const resolutionLegend = hasBlockers
    ? formatBulkCampaignAccessResolutionLegend({
        mode: blockedMode === 'bulk-all' ? 'all-blocked' : 'partial',
        descriptor,
      })
    : undefined

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
        hasBlockers
          ? formatBulkCampaignAccessBlockedTitle(descriptor)
          : BULK_CAMPAIGN_ACCESS_DIALOG_HEADLINE
      }
      description={description}
      useCustomResolveHeadline={hasBlockers}
      campaignId={campaignId}
      configureSlot={
        <FormProvider {...form}>
          <FormFieldStack fields={fields} idPrefix={formId} size="md" rhythm="comfortable" />
        </FormProvider>
      }
      summarySlot={
        <div className="space-y-1 text-sm text-muted-foreground">
          {isResolvePhase && resolveTally ? (
            <p>{resolveTally}</p>
          ) : preview.hasChanges ? (
            <p>{configureSummary}</p>
          ) : null}
          <p>{BULK_CAMPAIGN_ACCESS_DRAFT_NOTE}</p>
        </div>
      }
      localError={lifecycle.localError}
      resolutionRows={lifecycle.resolutionRows}
      resolutionLegend={resolutionLegend}
      confirmedCount={lifecycle.confirmedCount}
      resolveNoun={itemLabelPlural}
      onCheckedChange={lifecycle.toggleConfirmedTarget}
      onConfigureApply={handleConfigureApply}
      configureApplyDisabled={!preview.hasChanges}
      configureApplyLabel={configureApplyLabel}
      configureApplyHidden={!preview.hasChanges || preview.wouldChangeCount === 0}
      resolveApplyLabel={resolveApplyLabel}
      resolveApplyHidden={hasBlockers && lifecycle.confirmedCount === 0}
      onResolveConfirm={() => void lifecycle.confirmResolve()}
      onResolveBack={lifecycle.goBackToConfigure}
      onRetryFailed={() => void lifecycle.retryFailed()}
      onCancel={lifecycle.cancel}
      onAcceptMixedResult={lifecycle.acceptMixedResult}
    />
  )
}
