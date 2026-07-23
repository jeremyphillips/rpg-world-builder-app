'use client'

import { ChevronDown } from 'lucide-react'

import { cn } from '../../lib/utils'
import { accordionTriggerVariants } from './accordion.variants'
import {
  fieldGroupDescriptionTypographyClasses,
  fieldGroupLegendHeaderMarginVariants,
  fieldGroupLegendHeaderStackClasses,
  type FieldGroupLegendSize,
} from './field.variants'
import { Text } from './text'

export type FieldGroupLegendProps = {
  legend: string
  description?: string
  legendSize: FieldGroupLegendSize
  legendTypography: string
  legendChromeClassName: string
  collapsible: boolean
  open?: boolean
  onToggle?: () => void
}

export function FieldGroupLegend({
  legend,
  description,
  legendSize,
  legendTypography,
  legendChromeClassName,
  collapsible,
  open,
  onToggle,
}: FieldGroupLegendProps) {
  const headerMargin = fieldGroupLegendHeaderMarginVariants({ size: legendSize })
  const legendContent = description ? (
    <span className={cn(fieldGroupLegendHeaderStackClasses, headerMargin)}>
      <span>{legend}</span>
      <Text as="span" variant="small" className={fieldGroupDescriptionTypographyClasses}>
        {description}
      </Text>
    </span>
  ) : (
    legend
  )

  if (!collapsible) {
    return (
      <legend
        className={cn(
          legendTypography,
          'w-full min-w-0',
          legendChromeClassName,
          !description && headerMargin,
        )}
      >
        {legendContent}
      </legend>
    )
  }

  return (
    <legend className={cn(legendTypography, 'w-full min-w-0', legendChromeClassName)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={cn(
          accordionTriggerVariants({ variant: 'section' }),
          !description && headerMargin,
        )}
      >
        {legendContent}
        <ChevronDown
          className={cn('size-4 shrink-0 text-muted-foreground', open && 'rotate-180')}
          aria-hidden
        />
      </button>
    </legend>
  )
}
