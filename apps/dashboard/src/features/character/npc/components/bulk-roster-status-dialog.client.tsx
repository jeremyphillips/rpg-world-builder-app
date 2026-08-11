'use client'

import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import type { CampaignNpcListItem } from '@rpg/contracts'
import { FormFieldStack } from '@rpg/ui/form'

import {
  ActionDialogShell,
  buildActionDialogNotify,
  deriveActionApplySummary,
  finalizeActionDialogCloseWithOutcomes,
  NPC_ROSTER_STATUS_ACTION,
  useActionLifecycle,
  type ActionApplySummary,
  type ActionLifecycleCloseEvent,
} from '@/lib/actions'
import type { ActionTargetFailure } from '@rpg/contracts'

import {
  BULK_ROSTER_STATUS_FORM_FIELD_DEFAULTS,
  buildBulkRosterStatusFields,
  type BulkRosterStatusFormFieldValues,
} from '../lib/bulk/build-bulk-roster-status-fields'
import {
  resolveBulkRosterStatusPreview,
  toBulkRosterStatusFormValues,
} from '../lib/bulk/resolve-bulk-roster-status-preview'
import { useBulkRosterStatusAction } from '../hooks/use-bulk-roster-status-action.client'

export type BulkRosterStatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  selectedRows: CampaignNpcListItem[]
  onApplyComplete: (result: ActionApplySummary) => void
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
  const pendingConfigRef = useRef<ReturnType<typeof toBulkRosterStatusFormValues> | null>(null)

  const targets = useMemo(
    () =>
      selectedRows.map((row) => ({
        targetId: row.character.id,
        targetName: row.character.name,
      })),
    [selectedRows],
  )

  const closeGuardRef = useRef(false)

  const { apply, notifyClose } = useBulkRosterStatusAction({
    campaignId,
    rows: selectedRows,
  })

  const handleClose = useCallback(
    (event: ActionLifecycleCloseEvent<never, ActionTargetFailure>) => {
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
    requiresValidation: false,
    apply,
    onClose: handleClose,
  })

  useEffect(() => {
    if (open) {
      closeGuardRef.current = false
      return
    }

    form.reset(BULK_ROSTER_STATUS_FORM_FIELD_DEFAULTS)
  }, [form, open])

  const handleConfigureApply = useCallback(() => {
    const config = toBulkRosterStatusFormValues(form.getValues())
    pendingConfigRef.current = config
    void lifecycle.startApply(config)
  }, [form, lifecycle])

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
      headline="Edit roster status"
      description={`Apply roster status changes to ${selectedRows.length} selected NPC${selectedRows.length === 1 ? '' : 's'}.`}
      configureSlot={
        <FormProvider {...form}>
          <FormFieldStack fields={fields} idPrefix={formId} density="compact" />
        </FormProvider>
      }
      summarySlot={
        <p className="text-sm text-muted-foreground">
          {preview.wouldChangeCount} will change, {preview.unchangedCount} already match.
        </p>
      }
      localError={lifecycle.localError}
      resolutionRows={lifecycle.resolutionRows}
      confirmedCount={lifecycle.confirmedCount}
      resolveNoun={NPC_ROSTER_STATUS_ACTION.nounPlural.toLowerCase()}
      onConfigureApply={handleConfigureApply}
      configureApplyDisabled={!preview.hasChanges || preview.wouldChangeCount === 0}
      onRetryFailed={() => void lifecycle.retryFailed()}
      onCancel={lifecycle.cancel}
      onAcceptMixedResult={lifecycle.acceptMixedResult}
    />
  )
}
