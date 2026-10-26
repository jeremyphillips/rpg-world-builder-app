'use client'

import * as React from 'react'

import {
  ACTION_DETAILS_DEFAULT_ARIA_LABEL,
  ACTION_ICONS,
  type ActionIconVerb,
} from './action-icons.map'
import { Button, type ButtonProps } from './button.client'
import { Icon } from './icon/icon'

export type ActionButtonProps = Omit<ButtonProps, 'children'> & {
  action: ActionIconVerb
  children?: React.ReactNode
}

/**
 * Button with a registry-backed leading action glyph. Does not infer destructive styling
 * from `action="remove"` — use remove wrappers or pass `variant` explicitly.
 */
export function ActionButton({
  action,
  children,
  className,
  variant,
  size,
  'aria-label': ariaLabel,
  ...buttonProps
}: ActionButtonProps) {
  const hasLabel = children != null && children !== ''
  const resolvedAriaLabel = ariaLabel
    ? ariaLabel
    : !hasLabel && action === 'details'
      ? ACTION_DETAILS_DEFAULT_ARIA_LABEL
      : undefined

  return (
    <Button
      type="button"
      className={className}
      variant={variant}
      size={size}
      {...(buttonProps as ButtonProps)}
      aria-label={resolvedAriaLabel}
    >
      <Icon name={ACTION_ICONS[action]} size="owner" />
      {hasLabel ? children : null}
    </Button>
  )
}
