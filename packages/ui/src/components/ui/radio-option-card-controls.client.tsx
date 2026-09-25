'use client'

import type * as React from 'react'
import { Circle } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  radioCardControlVariants,
  radioCardIconControlVariants,
  radioCardIndicatorVariants,
  type RadioCardVariant,
  type RadioCardVisualControl,
} from './radio-card.variants'
import type { SelectionOptionCardDensity } from './selection-option-card-anatomy.client'

function RadioOptionCardControl({
  className,
  variant = 'card',
  density = 'default',
}: {
  className?: string
  variant?: RadioCardVariant
  density?: SelectionOptionCardDensity
}) {
  const indicatorSize = variant === 'row' ? 'size-2.5' : density === 'compact' ? 'size-2' : 'size-3'

  return (
    <span
      className={cn(radioCardControlVariants({ variant, density }), 'mt-0.5', className)}
      aria-hidden="true"
    >
      <span className={radioCardIndicatorVariants()}>
        <Circle className={cn('fill-primary text-primary', indicatorSize)} />
      </span>
    </span>
  )
}

function RadioOptionCardIconControl({
  icon,
  density = 'default',
  className,
}: {
  icon: React.ReactNode
  density?: SelectionOptionCardDensity
  className?: string
}) {
  return (
    <span
      className={cn(radioCardIconControlVariants({ density }), 'mt-0.5', className)}
      aria-hidden="true"
    >
      {icon}
    </span>
  )
}

export function RadioOptionCardLeadingControl({
  visualControl = 'radio',
  icon,
  variant = 'card',
  density = 'default',
  className,
}: {
  visualControl?: RadioCardVisualControl
  icon?: React.ReactNode
  variant?: RadioCardVariant
  density?: SelectionOptionCardDensity
  className?: string
}) {
  if (visualControl === 'icon') {
    return icon ? (
      <RadioOptionCardIconControl icon={icon} density={density} className={className} />
    ) : null
  }

  return <RadioOptionCardControl variant={variant} density={density} className={className} />
}
