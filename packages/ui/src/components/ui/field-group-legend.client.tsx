'use client'

import { ChevronDown } from 'lucide-react'

import { cn } from '../../lib/utils'
import { formSectionHeaderLabelRowClasses } from '../../form/presentation/form-section-header.variants'
import { accordionTriggerVariants } from './accordion.variants'
import {
  fieldGroupDescriptionCompactTypographyClasses,
  fieldGroupDescriptionTypographyClasses,
  fieldGroupLegendHeaderMarginVariants,
  fieldGroupLegendHeaderStackVariants,
  type FieldGroupLegendSize,
  type FieldRhythm,
} from './field.variants'
import { Text } from './text'

export type FieldGroupLegendProps = {
  legend: string
  description?: string
  /** Non-interactive status/decoration beside the legend label (group headings only). */
  legendAccessory?: React.ReactNode
  legendSize: FieldGroupLegendSize
  legendTypography: string
  legendChromeClassName: string
  collapsible: boolean
  rhythm?: FieldRhythm
  open?: boolean
  onToggle?: () => void
}

function LegendLabelRow({ legend, accessory }: { legend: string; accessory?: React.ReactNode }) {
  if (!accessory) {
    return <>{legend}</>
  }
  return (
    <span className={formSectionHeaderLabelRowClasses}>
      <span className="min-w-0 truncate">{legend}</span>
      <span className="shrink-0">{accessory}</span>
    </span>
  )
}

type LegendContentOptions = {
  legend: string
  description?: string
  legendAccessory?: React.ReactNode
  collapsible: boolean
  rhythm: FieldRhythm
  headerMargin: string
  descriptionTypography: string
}

function resolveLegendPrimaryLabel(options: LegendContentOptions): React.ReactNode {
  const { legend, legendAccessory, collapsible } = options
  if (collapsible) {
    return <span>{legend}</span>
  }
  return <LegendLabelRow legend={legend} accessory={legendAccessory} />
}

function resolveLegendContent(options: LegendContentOptions): React.ReactNode {
  const { description, rhythm, headerMargin, descriptionTypography } = options
  if (!description) {
    return options.collapsible ? options.legend : resolveLegendPrimaryLabel(options)
  }
  return (
    <span className={cn(fieldGroupLegendHeaderStackVariants({ rhythm }), headerMargin)}>
      {resolveLegendPrimaryLabel(options)}
      <Text
        as="span"
        variant={rhythm === 'compact' ? 'caption' : 'small'}
        className={descriptionTypography}
      >
        {description}
      </Text>
    </span>
  )
}

function StaticFieldGroupLegend({
  legendTypography,
  legendChromeClassName,
  headerMargin,
  description,
  legendContent,
}: {
  legendTypography: string
  legendChromeClassName: string
  headerMargin: string
  description?: string
  legendContent: React.ReactNode
}) {
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

function CollapsibleFieldGroupLegend({
  legendTypography,
  legendChromeClassName,
  headerMargin,
  description,
  legendContent,
  legendAccessory,
  open,
  onToggle,
}: {
  legendTypography: string
  legendChromeClassName: string
  headerMargin: string
  description?: string
  legendContent: React.ReactNode
  legendAccessory?: React.ReactNode
  open?: boolean
  onToggle?: () => void
}) {
  return (
    <legend className={cn(legendTypography, 'w-full min-w-0', legendChromeClassName)}>
      <div className={cn('flex w-full min-w-0 items-start gap-2', !description && headerMargin)}>
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className={cn(accordionTriggerVariants({ variant: 'section' }), 'min-w-0 flex-1')}
        >
          {legendContent}
          <ChevronDown
            className={cn('size-4 shrink-0 text-muted-foreground', open && 'rotate-180')}
            aria-hidden
          />
        </button>
        {legendAccessory ? <span className="shrink-0 pt-0.5">{legendAccessory}</span> : null}
      </div>
    </legend>
  )
}

export function FieldGroupLegend({
  legend,
  description,
  legendAccessory,
  legendSize,
  legendTypography,
  legendChromeClassName,
  collapsible,
  rhythm = 'comfortable',
  open,
  onToggle,
}: FieldGroupLegendProps) {
  const headerMargin =
    legendSize === 'array' ? '' : fieldGroupLegendHeaderMarginVariants({ size: legendSize, rhythm })
  const descriptionTypography =
    rhythm === 'compact'
      ? fieldGroupDescriptionCompactTypographyClasses
      : fieldGroupDescriptionTypographyClasses

  const contentOptions: LegendContentOptions = {
    legend,
    description,
    legendAccessory,
    collapsible,
    rhythm,
    headerMargin,
    descriptionTypography,
  }
  const legendContent = resolveLegendContent(contentOptions)

  if (!collapsible) {
    return (
      <StaticFieldGroupLegend
        legendTypography={legendTypography}
        legendChromeClassName={legendChromeClassName}
        headerMargin={headerMargin}
        description={description}
        legendContent={legendContent}
      />
    )
  }

  return (
    <CollapsibleFieldGroupLegend
      legendTypography={legendTypography}
      legendChromeClassName={legendChromeClassName}
      headerMargin={headerMargin}
      description={description}
      legendContent={legendContent}
      legendAccessory={legendAccessory}
      open={open}
      onToggle={onToggle}
    />
  )
}
