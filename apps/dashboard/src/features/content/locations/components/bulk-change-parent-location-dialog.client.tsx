'use client'

import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type {
  ActionApplyOutcome,
  ActionTargetFailure,
  Location,
  LocationParentAssignmentBlocker,
  WithCampaignAccess,
} from '@rpg/contracts'
import { FormFieldStack } from '@rpg/ui/form'

import {
  ActionDialogShell,
  finalizeActionDialogClose,
  useActionLifecycle,
  type ActionLifecycleCloseEvent,
} from '@/lib/actions'

import {
  BULK_CHANGE_PARENT_FORM_FIELD_DEFAULTS,
  buildBulkChangeParentFields,
  toBulkChangeParentConfig,
  type BulkChangeParentFormFieldValues,
} from '../lib/bulk/build-bulk-change-parent-fields'
import { resolveBulkChangeParentDialogPresentation } from '../lib/bulk/resolve-bulk-change-parent-dialog-presentation'
import { resolveBulkChangeParentPreview } from '../lib/bulk/resolve-bulk-change-parent-preview'
import { useBulkChangeParentAction } from '../lib/bulk/use-bulk-change-parent-action.client'
import type { ContentBase } from '../../lib/overview/content-table-config'

export type BulkChangeParentLocationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  selectedRows: Array<WithCampaignAccess<ContentBase & Location & { id: string }>>
  campaignLocations: readonly Location[]
  onApplyComplete: (
    outcomes: ActionApplyOutcome<LocationParentAssignmentBlocker, ActionTargetFailure>[],
  ) => void
}

export function BulkChangeParentLocationDialog({
  open,
  onOpenChange,
  campaignId,
  selectedRows,
  campaignLocations,
  onApplyComplete,
}: BulkChangeParentLocationDialogProps) {
  const formId = useId()
  const fields = useMemo(() => buildBulkChangeParentFields(campaignLocations), [campaignLocations])
  const form = useForm<BulkChangeParentFormFieldValues>({
    defaultValues: BULK_CHANGE_PARENT_FORM_FIELD_DEFAULTS,
  })
  const fieldValues = useWatch({ control: form.control }) as BulkChangeParentFormFieldValues
  const preview = useMemo(
    () =>
      resolveBulkChangeParentPreview(
        selectedRows,
        fieldValues ?? BULK_CHANGE_PARENT_FORM_FIELD_DEFAULTS,
        campaignLocations,
      ),
    [campaignLocations, fieldValues, selectedRows],
  )

  const targets = useMemo(
    () => selectedRows.map((row) => ({ targetId: row.id, targetName: row.name })),
    [selectedRows],
  )

  const { validate, apply, notifyClose } = useBulkChangeParentAction({
    campaignId,
    rows: selectedRows,
    campaignLocations,
  })

  const pendingConfigRef = useRef<ReturnType<typeof toBulkChangeParentConfig> | null>(null)

  const handleClose = useCallback(
    (event: ActionLifecycleCloseEvent<LocationParentAssignmentBlocker, ActionTargetFailure>) => {
      finalizeActionDialogClose(
        onOpenChange,
        event.reason === 'cancel'
          ? undefined
          : () => {
              notifyClose(event, pendingConfigRef.current)
              onApplyComplete(event.outcomes)
            },
      )
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
    if (!open) {
      form.reset(BULK_CHANGE_PARENT_FORM_FIELD_DEFAULTS)
    }
  }, [form, open])

  const handleConfigureApply = useCallback(() => {
    const config = toBulkChangeParentConfig(form.getValues())
    if (!config) {
      return
    }

    pendingConfigRef.current = config
    void lifecycle.startApply(config)
  }, [form, lifecycle])

  const isResolvePhase = lifecycle.phase === 'resolve'
  const hasBlockers = isResolvePhase && lifecycle.blockedCount > 0
  const presentation = resolveBulkChangeParentDialogPresentation({
    isResolvePhase,
    hasBlockers,
    blockedCount: lifecycle.blockedCount,
    confirmedCount: lifecycle.confirmedCount,
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
          <FormFieldStack fields={fields} idPrefix={formId} size="md" rhythm="comfortable" />
        </FormProvider>
      }
      summarySlot={presentation.summarySlot}
      localError={lifecycle.localError}
      resolutionRows={lifecycle.resolutionRows}
      resolutionLegend={presentation.resolutionLegend}
      confirmedCount={lifecycle.confirmedCount}
      resolveNoun="locations"
      onCheckedChange={lifecycle.toggleConfirmedTarget}
      onConfigureApply={handleConfigureApply}
      configureApplyDisabled={!preview.isConfigured}
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
