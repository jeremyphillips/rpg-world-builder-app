'use client'

import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import type {
  VocabularyOptionSetId,
  VocabularyOptionStatus,
  ContentUsageBlocker,
  ActionTargetFailure,
} from '@rpg/contracts'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { FormFieldStack } from '@rpg/ui/form'
import type { VocabularyOptionWithUsage } from '@rpg/contracts'

import {
  ActionDialogShell,
  buildActionDialogNotify,
  deriveActionApplySummary,
  finalizeActionDialogCloseWithOutcomes,
  formatActionBlockedDescription,
  formatActionBlockedTitle,
  useActionLifecycle,
  VOCABULARY_DISABLE_ACTION,
  type ActionApplySummary,
  type ActionLifecycleCloseEvent,
} from '@/lib/actions'

import { VOCABULARY_STATUS_LABELS } from '@/features/vocabulary'

import { VOCABULARY_BULK_AVAILABILITY_DIALOG_HEADLINE } from '../lib/labels'
import { useBulkVocabularyAvailabilityAction } from '../lib/vocabulary/bulk/use-bulk-vocabulary-availability-action.client'

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
  onApplyComplete: (result: ActionApplySummary) => void
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
  const pendingStatusRef = useRef<VocabularyOptionStatus>('active')

  const targets = useMemo(
    () => selectedRows.map((row) => ({ targetId: row.id, targetName: row.label })),
    [selectedRows],
  )

  const previewCount = useMemo(
    () => selectedRows.filter((row) => row.status !== status).length,
    [selectedRows, status],
  )

  const closeGuardRef = useRef(false)

  const { validate, apply, notifyClose } = useBulkVocabularyAvailabilityAction({
    campaignId,
    setId,
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
          notify: () => notifyClose(event),
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

    form.reset({ status: 'active' })
  }, [form, open])

  const handleConfigureApply = useCallback(() => {
    const nextStatus = form.getValues('status') ?? 'active'
    pendingStatusRef.current = nextStatus
    void lifecycle.startApply(nextStatus)
  }, [form, lifecycle])

  const blockedMode =
    lifecycle.blockedCount === previewCount
      ? 'bulk-all'
      : lifecycle.blockedCount > 0
        ? 'bulk-partial'
        : 'single'

  const resolveDescription =
    lifecycle.phase === 'resolve' && lifecycle.blockedCount > 0
      ? formatActionBlockedDescription({
          mode: blockedMode,
          action: VOCABULARY_DISABLE_ACTION,
          blockedCount: lifecycle.blockedCount,
          selectedCount: previewCount,
          noun: 'entry',
          referenceNoun: 'content reference',
        })
      : undefined

  const description =
    lifecycle.phase === 'resolve' && resolveDescription
      ? resolveDescription
      : `Apply a new availability status to ${selectedRows.length} selected ${
          selectedRows.length === 1 ? 'entry' : 'entries'
        }.`

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
          ? formatActionBlockedTitle({ mode: blockedMode, action: VOCABULARY_DISABLE_ACTION })
          : VOCABULARY_BULK_AVAILABILITY_DIALOG_HEADLINE
      }
      description={description}
      campaignId={campaignId}
      configureSlot={
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
      }
      summarySlot={
        <p className="text-sm text-muted-foreground">
          {previewCount} {previewCount === 1 ? 'entry' : 'entries'} will change.
        </p>
      }
      localError={lifecycle.localError}
      resolutionRows={lifecycle.resolutionRows}
      resolutionLegend="Apply to"
      confirmedCount={lifecycle.confirmedCount}
      resolveNoun="entries"
      onCheckedChange={lifecycle.toggleConfirmedTarget}
      onConfigureApply={handleConfigureApply}
      configureApplyDisabled={previewCount === 0}
      onResolveConfirm={() => void lifecycle.confirmResolve()}
      onResolveBack={lifecycle.goBackToConfigure}
      onRetryFailed={() => void lifecycle.retryFailed()}
      onCancel={lifecycle.cancel}
      onAcceptMixedResult={lifecycle.acceptMixedResult}
    />
  )
}
