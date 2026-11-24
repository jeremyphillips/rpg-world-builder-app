'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { RadioGroup, RadioGroupItem } from './radio-group.client'
import { useChoiceOptionLabelClassName } from './choice-option-typography.client'
import type { RadioGroupFieldOption } from './radio-group-field'

type RadioGroupFieldOptionsProps = {
  id: string
  labelId: string
  options: RadioGroupFieldOption[]
  name?: string
  disabled?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onBlur?: () => void
  orientation?: 'horizontal' | 'vertical'
} & Omit<React.ComponentPropsWithoutRef<typeof RadioGroup>, 'children'>

export const RadioGroupFieldOptions = React.forwardRef<
  React.ComponentRef<typeof RadioGroup>,
  RadioGroupFieldOptionsProps
>(function RadioGroupFieldOptions(
  {
    id,
    labelId,
    options,
    name,
    disabled,
    value,
    defaultValue,
    onValueChange,
    onBlur,
    orientation = 'vertical',
  className,
    ...groupProps
  },
  ref,
) {
  const optionLabelClassName = useChoiceOptionLabelClassName()

  return (
    <RadioGroup
      ref={ref}
      aria-labelledby={labelId}
      name={name}
      disabled={disabled}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      onBlur={onBlur}
      className={cn(
        orientation === 'horizontal' ? 'flex flex-wrap items-center gap-x-6 gap-y-2' : 'grid gap-2',
        className,
      )}
      {...groupProps}
    >
      {options.map((option) => {
        const optionId = `${id}-${option.value}`
        return (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem id={optionId} value={option.value} disabled={option.disabled} />
            <label htmlFor={optionId} className={optionLabelClassName}>
              {option.label}
            </label>
          </div>
        )
      })}
    </RadioGroup>
  )
})