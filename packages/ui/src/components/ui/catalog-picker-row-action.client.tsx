'use client'

import * as React from 'react'

import { CatalogPickerActionButton } from './catalog-picker-action-button.client'
import type { CatalogPickerRowActionIntent } from './catalog-picker-action-button.client'
import { resolvePickerActionFailureStatus } from './catalog-picker-row-action.lib'
import {
  catalogPickerRowActionFailureVariants,
  catalogPickerRowActionTooltipTriggerVariants,
  catalogPickerRowActionVariants,
} from './catalog-picker-row-action.variants'
import type { ButtonProps } from './button.client'
import { Text } from './text'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip.client'

export type CatalogPickerRowActionTooltip = {
  title?: string
  body: string
}

export type CatalogPickerRowActionProps = {
  intent: CatalogPickerRowActionIntent
  /** Stable imperative. Failure copy is derived from this, never from the pending label. */
  actionLabel: string
  pendingLabel?: string
  pending?: boolean
  disabled?: boolean
  /** The latest attempt failed. The action clears the line on retry, success, and scope change. */
  failed?: boolean
  /** Identifies the row entity so a stale failure does not follow a different row. */
  entityKey?: string
  tooltip?: CatalogPickerRowActionTooltip
  onClick: () => void
  variant?: ButtonProps['variant']
}

type FailureLatch = {
  reportScope: string | null
  dismissed: boolean
}

function tooltipAccessibleName(
  actionLabel: string,
  tooltip: CatalogPickerRowActionTooltip,
): string {
  return [actionLabel, tooltip.title, tooltip.body]
    .filter((part) => part !== undefined && part.trim().length > 0)
    .join(', ')
}

function tooltipPopupText(tooltip: CatalogPickerRowActionTooltip): string {
  return tooltip.title ? `${tooltip.title}. ${tooltip.body}` : tooltip.body
}

/**
 * Clears a reported failure when the user retries, the report drops, or the
 * action/entity scope changes. A new report is a rising `failed` edge.
 */
function useCatalogPickerRowActionFailure(args: {
  failed: boolean
  pending: boolean
  scope: string
}): { visible: boolean; dismiss: () => void } {
  const [latch, setLatch] = React.useState<FailureLatch>({
    reportScope: null,
    dismissed: false,
  })

  if (!args.failed) {
    if (latch.reportScope !== null || latch.dismissed) {
      setLatch({ reportScope: null, dismissed: false })
    }
  } else if (latch.reportScope === null && !latch.dismissed) {
    setLatch({ reportScope: args.scope, dismissed: false })
  }

  const dismiss = React.useCallback(() => {
    setLatch((current) => ({ ...current, dismissed: true }))
  }, [])

  const visible =
    args.failed && !args.pending && !latch.dismissed && latch.reportScope === args.scope

  return { visible, dismiss }
}

export function CatalogPickerRowAction({
  intent,
  actionLabel,
  pendingLabel,
  pending = false,
  disabled = false,
  failed = false,
  entityKey,
  tooltip,
  onClick,
  variant,
}: CatalogPickerRowActionProps) {
  const scope = `${entityKey ?? ''}\0${actionLabel}`
  const { visible, dismiss } = useCatalogPickerRowActionFailure({
    failed,
    pending,
    scope,
  })
  const displayLabel = pending && pendingLabel ? pendingLabel : actionLabel
  const inactive = disabled || pending
  const showTooltip = Boolean(tooltip) && inactive && !pending
  const failureStatus = resolvePickerActionFailureStatus(actionLabel)

  const button = (
    <CatalogPickerActionButton
      intent={intent}
      disabled={inactive}
      tabIndex={showTooltip ? -1 : undefined}
      variant={variant}
      onClick={() => {
        dismiss()
        onClick()
      }}
    >
      {displayLabel}
    </CatalogPickerActionButton>
  )

  return (
    <div className={catalogPickerRowActionVariants()}>
      {showTooltip && tooltip ? (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                tabIndex={0}
                aria-label={tooltipAccessibleName(actionLabel, tooltip)}
                className={catalogPickerRowActionTooltipTriggerVariants()}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') event.preventDefault()
                }}
              >
                {button}
              </span>
            </TooltipTrigger>
            <TooltipContent>{tooltipPopupText(tooltip)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        button
      )}
      {visible ? (
        <Text
          as="span"
          variant="destructive"
          className={catalogPickerRowActionFailureVariants()}
          role="status"
          aria-live="polite"
        >
          {failureStatus}
        </Text>
      ) : null}
    </div>
  )
}
