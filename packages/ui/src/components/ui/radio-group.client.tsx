'use client'
import { Icon } from './icon/icon'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cn } from '../../lib/utils'
import {
  UI_CHOICE_CONTROL_MARK_CLASS,
  radioGroupItemControlClasses,
} from './choice-control.variants'

const RadioGroupValueContext = React.createContext<string | null | undefined>(undefined)

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <RadioGroupValueContext.Provider value={value}>
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn('grid gap-2', className)}
      value={value}
      {...props}
    />
  </RadioGroupValueContext.Provider>
))
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

export function useRadioGroupItemSelected(optionValue: string): boolean {
  const groupValue = React.useContext(RadioGroupValueContext)
  return groupValue === optionValue
}

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
        <Icon name="circle" size="owner" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
