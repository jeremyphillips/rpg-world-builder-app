'use client'

import { ChevronDown } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  formSectionHeaderActionLayoutClasses,
  formSectionHeaderActionSlotClasses,
  formSectionHeaderLabelRowClasses,
} from '../../form/presentation/form-section-header.variants'
import {
  fieldGroupDescriptionCompactTypographyClasses,
  fieldGroupDescriptionTypographyClasses,
  fieldGroupLegendDisclosureTriggerVariants,
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
  /** Trailing compact inline action on the legend row end. */
  legendAction?: React.ReactNode
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
    <span className={cn(formSectionHeaderLabelRowClasses, 'items-baseline')}>
      <span className="min-w-0">{legend}</span>
      <span className="shrink-0">{accessory}</span>
    </span>
  )
}

function LegendActionEndSlot({ action }: { action: React.ReactNode }) {
  return <div className={formSectionHeaderActionSlotClasses}>{action}</div>
}

function LegendHeaderActionLayout({
  action,
  children,
}: {
  action?: React.ReactNode
  children: React.ReactNode
}) {
  if (!action) {
    return <>{children}</>
  }

  return (
    <div className={formSectionHeaderActionLayoutClasses}>
      <div className="min-w-0">{children}</div>
      <LegendActionEndSlot action={action} />
    </div>
  )
}

type LegendContentOptions = {
  legend: string
  description?: string
  legendAccessory?: React.ReactNode
  collapsible: boolean
  rhythm: FieldRhythm
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
  const { description, rhythm, descriptionTypography } = options
  if (!description) {
    return options.collapsible ? options.legend : resolveLegendPrimaryLabel(options)
  }
  return (
    <span className={fieldGroupLegendHeaderStackVariants({ rhythm })}>
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
  legendContent,
  legendAction,
}: {
  legendTypography: string
  legendChromeClassName: string
  legendContent: React.ReactNode
  legendAction?: React.ReactNode
}) {
  return (
    <legend className={cn(legendTypography, 'w-full min-w-0', legendChromeClassName)}>
      <LegendHeaderActionLayout action={legendAction}>{legendContent}</LegendHeaderActionLayout>
    </legend>
  )
}

function CollapsibleFieldGroupLegend({
  legendTypography,
  legendChromeClassName,
  legendContent,
  legendAccessory,
  legendAction,
  rhythm,
  open,
  onToggle,
}: {
  legendTypography: string
  legendChromeClassName: string
  legendContent: React.ReactNode
  legendAccessory?: React.ReactNode
  legendAction?: React.ReactNode
  rhythm: FieldRhythm
  open?: boolean
  onToggle?: () => void
}) {
  const toggleRow = (
    <div className="flex w-full min-w-0 items-start gap-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={fieldGroupLegendDisclosureTriggerVariants({ rhythm })}
      >
        {legendContent}
        <ChevronDown
          className={cn('size-4 shrink-0 text-muted-foreground', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {legendAccessory ? <span className="shrink-0 pt-0.5">{legendAccessory}</span> : null}
    </div>
  )

  return (
    <legend className={cn(legendTypography, 'w-full min-w-0', legendChromeClassName)}>
      <LegendHeaderActionLayout action={legendAction}>{toggleRow}</LegendHeaderActionLayout>
    </legend>
  )
}

export function FieldGroupLegend({
  legend,
  description,
  legendAccessory,
  legendAction,
  legendTypography,
  legendChromeClassName,
  collapsible,
  rhythm = 'comfortable',
  open,
  onToggle,
}: FieldGroupLegendProps) {
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
    descriptionTypography,
  }
  const legendContent = resolveLegendContent(contentOptions)

  if (!collapsible) {
    return (
      <StaticFieldGroupLegend
        legendTypography={legendTypography}
        legendChromeClassName={legendChromeClassName}
        legendContent={legendContent}
        legendAction={legendAction}
      />
    )
  }

  return (
    <CollapsibleFieldGroupLegend
      legendTypography={legendTypography}
      legendChromeClassName={legendChromeClassName}
      legendContent={legendContent}
      legendAccessory={legendAccessory}
      legendAction={legendAction}
      rhythm={rhythm}
      open={open}
      onToggle={onToggle}
    />
  )
}
