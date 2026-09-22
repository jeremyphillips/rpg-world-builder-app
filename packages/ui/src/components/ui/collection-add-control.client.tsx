'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'

import type { ButtonVariantProps } from './button.variants'
import { Button } from './button.client'
import { resolveCollectionAddDisabledProps } from './collection-add-control.lib'

export type CollectionAddControlProps = {
  label: string
  onClick?: () => void
  enabled: boolean
  disabledReason?: string
  variant?: NonNullable<ButtonVariantProps['variant']>
  size?: NonNullable<ButtonVariantProps['size']>
  density?: ButtonVariantProps['density']
  showIcon?: boolean
  className?: string
}

function CollectionAddTriggerLabel({
  label,
  showIcon = true,
}: Pick<CollectionAddControlProps, 'label' | 'showIcon'>) {
  if (!showIcon) return label

  return (
    <>
      <Plus aria-hidden />
      {label}
    </>
  )
}

function CollectionAddDisabledReason({
  disabledReason,
  disabledReasonId,
}: {
  disabledReason?: string
  disabledReasonId: string
}) {
  if (!disabledReason) return null

  return (
    <span id={disabledReasonId} className="sr-only">
      {disabledReason}
    </span>
  )
}

/** Outline add button shared by array and relationship collection fields. */
export function CollectionAddControl({
  label,
  onClick,
  enabled,
  disabledReason,
  variant = 'outline',
  size = 'sm',
  density,
  showIcon = true,
  className,
}: CollectionAddControlProps) {
  const disabledReasonId = React.useId()
  const disabledProps = resolveCollectionAddDisabledProps(enabled, disabledReason, disabledReasonId)

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        density={density}
        className={className}
        onClick={enabled ? onClick : undefined}
        aria-label={label}
        {...disabledProps}
      >
        <CollectionAddTriggerLabel label={label} showIcon={showIcon} />
      </Button>
      <CollectionAddDisabledReason
        disabledReason={disabledReason}
        disabledReasonId={disabledReasonId}
      />
    </>
  )
}
