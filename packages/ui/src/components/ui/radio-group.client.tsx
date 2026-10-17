'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  UI_CHOICE_CONTROL_MARK_CLASS,
  radioGroupItemControlClasses,
} from './choice-control.variants'

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root ref={ref} className={cn('grid gap-2', className)} {...props} />
))
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

type RadioGroupItemProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
  variant?: 'default' | 'tile'
}

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, variant = 'default', children, ...props }, ref) => {
  if (variant === 'tile') {
    return (
      <RadioGroupPrimitive.Item ref={ref} className={cn(className)} {...props}>
        {children}
      </RadioGroupPrimitive.Item>
    )
  }

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(radioGroupItemControlClasses(), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className={UI_CHOICE_CONTROL_MARK_CLASS}>
        <Circle aria-hidden />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
