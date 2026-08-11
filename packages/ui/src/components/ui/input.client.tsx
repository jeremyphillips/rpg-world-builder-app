'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { fieldControlVariants, type FieldControlVariantProps } from './field-control.variants'

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>, Pick<FieldControlVariantProps, 'size'> {
  /** When true, styles for embedding inside a grouped control such as InputActionGroup. */
  grouped?: boolean
}

const inputGroupedClasses =
  'border-0 bg-transparent shadow-none rounded-l-md rounded-r-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full min-w-0'

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', size, grouped, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          fieldControlVariants({ size }),
          grouped && inputGroupedClasses,
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className,
        )}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
