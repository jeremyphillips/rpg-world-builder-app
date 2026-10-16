'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  UI_CHOICE_CONTROL_MARK_CLASS,
  checkboxControlClasses,
  type CheckboxAppearance,
} from './choice-control.variants'

export type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  appearance?: CheckboxAppearance
}

const Checkbox = React.forwardRef<React.ComponentRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, appearance = 'default', ...props }, ref) => (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(checkboxControlClasses({ appearance }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn(UI_CHOICE_CONTROL_MARK_CLASS)}>
        <Check aria-hidden />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  ),
)
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
