'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { textareaVariants, type TextareaVariantProps } from './field-control.variants'

export interface TextareaProps
  extends React.ComponentProps<'textarea'>, Pick<TextareaVariantProps, 'size'> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, ...props }, ref) => {
    return <textarea ref={ref} className={cn(textareaVariants({ size }), className)} {...props} />
  },
)
Textarea.displayName = 'Textarea'

export { Textarea }
