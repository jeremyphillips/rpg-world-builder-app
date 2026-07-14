'use client'

import { ConfirmDialog } from '@rpg/ui'
import { useFormContext } from 'react-hook-form'

import { planResolutionChange } from '@rpg/contracts'

import type { ResolutionChangeDialogCopy } from '../../lib/selection/resolution-change-dialog.lib'
import { formatChangePlanForDialog } from '../../lib/selection/resolution-change-dialog.lib'
import { resolutionFormToSelectionContext } from '../../lib/selection/resolution-selection-context.lib'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'
import {
  useResolutionChangeController,
  useResolutionChangeSnapshot,
} from '../../hooks/use-resolution-change-confirm.client'

function ResolutionChangeConfirmDescription({ copy }: { copy: ResolutionChangeDialogCopy }) {
  return (
    <div className="space-y-3">
      <p>{copy.intro}</p>
      {copy.consequences.length > 0 ? (
        <ul className="list-disc space-y-1 ps-5">
          {copy.consequences.map((consequence) => (
            <li key={consequence}>{consequence}</li>
          ))}
        </ul>
      ) : null}
      <p>{copy.footer}</p>
    </div>
  )
}

/** Renders confirm dialog for resolution semantic changes — mount once per form. */
export function ResolutionChangeConfirmDialog() {
  const controller = useResolutionChangeController()
  const { pending } = useResolutionChangeSnapshot()
  const { getValues } = useFormContext()

  const dialogCopy = pending
    ? formatChangePlanForDialog(
        planResolutionChange(
          resolutionFormToSelectionContext(
            getValues(RESOLUTION_FIELD_NAME) as ResolutionFormValues | undefined,
          )!,
          pending.change,
        ),
        pending.change,
      )
    : null

  return (
    <ConfirmDialog
      open={pending != null}
      onOpenChange={(open) => {
        if (!open) controller.cancelPendingChange()
      }}
      headline={dialogCopy?.headline ?? 'Change resolution?'}
      description={
        dialogCopy ? <ResolutionChangeConfirmDescription copy={dialogCopy} /> : undefined
      }
      confirmLabel="Change resolution"
      onConfirm={controller.confirmPendingChange}
      onCancel={controller.cancelPendingChange}
    />
  )
}
