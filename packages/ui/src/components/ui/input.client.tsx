'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { fieldControlVariants, type FieldControlVariantProps } from './field-control.variants'

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>, Pick<FieldControlVariantProps, 'size'> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', size, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          fieldControlVariants({ size }),
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
