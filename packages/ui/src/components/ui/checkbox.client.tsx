'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

import { cn } from '../../lib/utils'
import { UI_CHOICE_CONTROL_MARK_CLASS, checkboxControlClasses } from './choice-control.variants'

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root ref={ref} className={cn(checkboxControlClasses(), className)} {...props}>
    <CheckboxPrimitive.Indicator className={cn(UI_CHOICE_CONTROL_MARK_CLASS)}>
      <Check aria-hidden />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
