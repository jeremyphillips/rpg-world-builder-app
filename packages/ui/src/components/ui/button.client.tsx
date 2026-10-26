'use client'

import * as React from 'react'

import { type ButtonVariantProps } from './button.variants'
import { resolveButtonAppearance } from './resolve-button-appearance'
import { type TextActionTone } from './text-action.variants'

type ButtonSharedProps = {
  size?: ButtonVariantProps['size']
}

/** Props for wrappers that forward `variant` without exposing `tone`. */
export type ButtonForwardingProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonSharedProps & {
    variant?: ButtonVariantProps['variant']
  }

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonSharedProps &
  (
    | { variant?: Exclude<ButtonVariantProps['variant'], 'text'>; tone?: never }
    | { variant: 'text'; tone?: TextActionTone }
  )

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', tone, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={resolveButtonAppearance({ variant, size, tone, className })}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
