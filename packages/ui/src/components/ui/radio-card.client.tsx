'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Circle } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge } from './badge'
import { RadioGroup } from './radio-group.client'
import {
  radioCardBodyVariants,
  radioCardControlVariants,
  radioCardIndicatorVariants,
  radioCardMetaListVariants,
  radioCardRootLayoutVariants,
  radioCardTitleRowVariants,
  radioCardTitleVariants,
  radioCardVariants,
} from './radio-card.variants'
import { textVariants } from './text.variants'

export interface RadioCardOption {
  label: string
  value: string
  disabled?: boolean
  description?: string
  /** Optional badge rendered inline with the title (e.g. "Recommended"). */
  badge?: string
  meta?: string[]
}

export interface RadioCardItemProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> {
  label: string
  description?: string
  badge?: string
  meta?: string[]
  /** Horizontal placement of the decorative radio control within the card. */
  controlPosition?: 'left' | 'right'
}

const RadioCardItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioCardItemProps
>(
  (
    { className, label, description, badge, meta, controlPosition = 'left', disabled, ...props },
    ref,
  ) => (
    <RadioGroupPrimitive.Item
      ref={ref}
      disabled={disabled}
      className={cn(radioCardVariants(), className)}
      {...props}
    >
      <div className={radioCardRootLayoutVariants({ controlPosition })}>
        <span className={cn(radioCardControlVariants(), 'mt-0.5')} aria-hidden="true">
          <span className={radioCardIndicatorVariants()}>
            <Circle className="size-3 fill-primary text-primary" />
          </span>
        </span>
        <div className={radioCardBodyVariants()}>
          <div className={radioCardTitleRowVariants()}>
            <span className={radioCardTitleVariants()}>{label}</span>
            {badge ? (
              <Badge variant="default" size="sm">
                {badge}
              </Badge>
            ) : null}
          </div>
          {description ? (
            <span className={textVariants({ variant: 'small' })}>{description}</span>
          ) : null}
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
        </div>
      </div>
    </RadioGroupPrimitive.Item>
  ),
)
RadioCardItem.displayName = 'RadioCardItem'

export interface RadioCardProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> {
  options: RadioCardOption[]
  /** Prefix for generated option ids (used with `htmlFor` when embedding items separately). */
  idPrefix?: string
  /** Horizontal placement of the decorative radio control within each card. */
  controlPosition?: 'left' | 'right'
}

/**
 * Card-style single-select built on Radix `RadioGroup`. Each option renders a
 * label, optional description, and optional meta chip list.
 */
function RadioCard({
  className,
  options,
  idPrefix = 'radio-card',
  controlPosition = 'left',
  ...props
}: RadioCardProps) {
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
          badge={option.badge}
          meta={option.meta}
          controlPosition={controlPosition}
        />
      ))}
    </RadioGroup>
  )
}

export { RadioCard, RadioCardItem, radioCardVariants }
