'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { buttonVariants, type ButtonVariantProps } from './button.variants'
import { textActionVariants, type TextActionTone } from './text-action.variants'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariantProps['variant']
  size?: ButtonVariantProps['size']
  density?: ButtonVariantProps['density']
  /** Standalone text-action tone — only applies when `variant="text"`. */
  tone?: TextActionTone
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, density, type = 'button', tone, ...props }, ref) => {
    const resolvedVariant = variant ?? 'default'

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          buttonVariants({ variant: resolvedVariant, size, density }),
          resolvedVariant === 'text'
            ? textActionVariants({ context: 'standalone', tone: tone ?? 'neutral' })
            : null,
          className,
        )}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button }
