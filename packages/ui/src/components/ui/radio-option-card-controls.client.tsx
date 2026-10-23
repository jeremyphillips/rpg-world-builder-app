'use client'

import type * as React from 'react'
import { Circle } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  radioCardControlVariants,
  type RadioCardVariant,
  type RadioCardVisualControl,
} from './radio-card.variants'
import type { SelectionOptionCardDensity } from './selection-option-card-anatomy.client'

function RadioOptionCardControl({
  className,
  variant = 'card',
  density = 'comfortable',
}: {
  className?: string
  variant?: RadioCardVariant
  density?: SelectionOptionCardDensity
}) {
  const indicatorSize = variant === 'row' ? 'size-2.5' : density === 'compact' ? 'size-2' : 'size-3'

  return (
    <span
      className={cn(
        radioCardControlVariants({ variant, density }),
        variant === 'row' && 'mt-0.5',
        className,
      )}
      aria-hidden="true"
    >
      <span className="ui-radio-card__indicator">
        <Circle className={cn('fill-primary text-primary', indicatorSize)} />
      </span>
    </span>
  )
}

function RadioOptionCardIconControl({
  icon,
  density = 'comfortable',
  className,
}: {
  icon: React.ReactNode
  density?: SelectionOptionCardDensity
  className?: string
}) {
  return (
    <span
      className={cn(
        'ui-radio-card__icon-control',
        density === 'compact'
          ? 'ui-radio-card__icon-control--compact'
          : 'ui-radio-card__icon-control--comfortable',
        className,
      )}
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
  density = 'comfortable',
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
