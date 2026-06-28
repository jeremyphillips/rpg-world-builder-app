'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'

import { cn } from '../../lib/utils'
import { Badge } from './badge'
import { RadioGroup } from './radio-group.client'
import { radioCardMetaListVariants, radioCardVariants } from './radio-card.variants'
import { textVariants } from './text.variants'

export interface RadioCardOption {
  label: string
  value: string
  disabled?: boolean
  description?: string
  meta?: string[]
}

export interface RadioCardItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label: string
  description?: string
  meta?: string[]
}

const RadioCardItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioCardItemProps
>(({ className, label, description, meta, disabled, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    disabled={disabled}
    className={cn(radioCardVariants(), className)}
    {...props}
  >
    <span className={textVariants({ variant: 'emphasis' })}>{label}</span>
    {description ? <span className={textVariants({ variant: 'small' })}>{description}</span> : null}
    {meta && meta.length > 0 ? (
      <ul className={radioCardMetaListVariants()} aria-hidden="true">
        {meta.map((chip) => (
          <li key={chip}>
            <Badge variant="secondary" size="sm">
              {chip}
            </Badge>
          </li>
        ))}
      </ul>
    ) : null}
  </RadioGroupPrimitive.Item>
))
RadioCardItem.displayName = 'RadioCardItem'

export interface RadioCardProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  options: RadioCardOption[]
  /** Prefix for generated option ids (used with `htmlFor` when embedding items separately). */
  idPrefix?: string
}

/**
 * Card-style single-select built on Radix `RadioGroup`. Each option renders a
 * label, optional description, and optional meta chip list.
 */
function RadioCard({ className, options, idPrefix = 'radio-card', ...props }: RadioCardProps) {
  return (
    <RadioGroup className={cn('grid gap-3', className)} {...props}>
      {options.map((option) => (
        <RadioCardItem
          key={option.value}
          id={`${idPrefix}-${option.value}`}
          value={option.value}
          disabled={option.disabled}
          label={option.label}
          description={option.description}
          meta={option.meta}
        />
      ))}
    </RadioGroup>
  )
}

export { RadioCard, RadioCardItem, radioCardVariants }
