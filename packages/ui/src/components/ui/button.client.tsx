'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { buttonVariants, type ButtonVariantProps } from './button.variants'
import { textActionVariants, type TextActionTone } from './text-action.variants'

type ButtonSharedProps = {
  size?: ButtonVariantProps['size']
  density?: ButtonVariantProps['density']
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
  ({ className, variant, size, density, type = 'button', tone, ...props }, ref) => {
    const resolvedVariant = variant ?? 'default'

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          buttonVariants({ variant: resolvedVariant, size, density }),
          resolvedVariant === 'text' ? textActionVariants({ context: 'standalone', tone }) : null,
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
