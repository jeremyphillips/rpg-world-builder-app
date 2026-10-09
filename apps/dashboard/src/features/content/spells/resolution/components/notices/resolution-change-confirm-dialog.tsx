import { cn, ConfirmDialog, Text, textVariants } from '@rpg/ui'
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
} from '../../hooks/use-resolution-change-confirm'

function ResolutionChangeConfirmBody({ copy }: { copy: ResolutionChangeDialogCopy }) {
  const bodyClass = textVariants({ variant: 'small' })

  return (
    <div className="space-y-3">
      {copy.consequences.length > 0 ? (
        <ul className={cn('list-disc space-y-1 ps-5', bodyClass)}>
          {copy.consequences.map((consequence) => (
            <li key={consequence}>{consequence}</li>
          ))}
        </ul>
      ) : null}
      <Text variant="small" as="p">
        {copy.footer}
      </Text>
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
      description={dialogCopy?.intro}
      confirmLabel="Change resolution"
      onConfirm={controller.confirmPendingChange}
      onCancel={controller.cancelPendingChange}
    >
      {dialogCopy ? <ResolutionChangeConfirmBody copy={dialogCopy} /> : null}
    </ConfirmDialog>
  )
}
