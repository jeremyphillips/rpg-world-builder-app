'use client'

import * as React from 'react'

import { ACTION_ICONS, type ActionIconVerb } from './action-icons.map'
import { Button, type ButtonProps } from './button.client'
import { Icon } from './icon/icon'
import type { IconSize } from './icon/icon.types'

export type ActionButtonProps = Omit<ButtonProps, 'children'> & {
  action: ActionIconVerb
  children?: React.ReactNode
  /**
   * Explicit glyph step. Omit it to let the button owner publish `--icon-size`.
   * Kept where a caller already rendered a step that differs from that owner.
   */
  iconStep?: IconSize
}

/**
 * Button with a registry-backed leading action glyph. Does not infer destructive styling
 * from `action="remove"` — use remove wrappers or pass `variant` explicitly.
 */
export function ActionButton({
  action,
  children,
  iconStep,
  className,
  variant,
  size,
  density,
  ...buttonProps
}: ActionButtonProps) {
  const hasLabel = children != null && children !== ''

  return (
    <Button
      type="button"
      className={className}
      variant={variant}
      size={size}
      density={density}
      {...(buttonProps as ButtonProps)}
    >
      <Icon name={ACTION_ICONS[action]} size={iconStep ?? 'owner'} />
      {hasLabel ? children : null}
    </Button>
  )
}
