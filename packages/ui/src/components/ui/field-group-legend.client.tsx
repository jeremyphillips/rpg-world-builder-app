'use client'
import { Icon } from './icon/icon'

import { cn } from '../../lib/utils'
import { FormSectionHeader } from '../../form/presentation/form-section-header.client'
import {
  fieldGroupLegendDisclosureTriggerVariants,
  type FieldGroupLegendSize,
  type FieldRhythm,
  type GroupHeadingScale,
} from './field.variants'
import type { FieldSize } from './field.client'
import { resolveEffectiveFormHeaderScaleFromLegendSize } from '../../form/presentation/form-header-stack-typography.lib'
import {
  formSectionHeaderActionSlotClasses,
  resolveFormSectionHeaderActionLayoutClasses,
} from '../../form/presentation/form-section-header.variants'

const legendChromeClasses = 'w-full min-w-0'

export type FieldGroupLegendProps = {
  legend: string
  legendSrOnly?: boolean
  description?: string
  /** Non-interactive status/decoration beside the legend label (group headings only). */
  legendAccessory?: React.ReactNode
  /** Trailing compact inline action on the legend row end. */
  legendAction?: React.ReactNode
  legendSize: FieldGroupLegendSize
  fieldSize?: FieldSize
  headingScale?: GroupHeadingScale
  legendChromeClassName: string
  collapsible: boolean
  rhythm?: FieldRhythm
  open?: boolean
  onToggle?: () => void
}

function legendClassName(legendChromeClassName: string, legendSrOnly: boolean): string {
  if (legendSrOnly) return 'sr-only'
  return cn(legendChromeClasses, legendChromeClassName)
}

function StaticFieldGroupLegend({
  legendChromeClassName,
  legendSrOnly,
  presentationScale,
  rhythm,
  fieldSize,
  legend,
  description,
  legendAccessory,
  legendAction,
}: {
  legendChromeClassName: string
  legendSrOnly: boolean
  presentationScale: ReturnType<typeof resolveEffectiveFormHeaderScaleFromLegendSize>
  rhythm: FieldRhythm
  fieldSize: FieldSize
  legend: string
  description?: string
  legendAccessory?: React.ReactNode
  legendAction?: React.ReactNode
}) {
  return (
    <legend className={legendClassName(legendChromeClassName, legendSrOnly)}>
      <FormSectionHeader
        label={legend}
        hint={description}
        headingScale={presentationScale}
        rhythm={rhythm}
        size={fieldSize}
        labelAccessory={legendAccessory}
        action={legendAction}
      />
    </legend>
  )
}

function CollapsibleFieldGroupLegend({
  legendChromeClassName,
  legendSrOnly,
  presentationScale,
  rhythm,
  fieldSize,
  legend,
  description,
  legendAccessory,
  legendAction,
  open,
  onToggle,
}: {
  legendChromeClassName: string
  legendSrOnly: boolean
  presentationScale: ReturnType<typeof resolveEffectiveFormHeaderScaleFromLegendSize>
  rhythm: FieldRhythm
  fieldSize: FieldSize
  legend: string
  description?: string
  legendAccessory?: React.ReactNode
  legendAction?: React.ReactNode
  open?: boolean
  onToggle?: () => void
}) {
  const hasStackedHint = Boolean(description)
  const headingInTrigger = (
    <FormSectionHeader
      label={legend}
      hint={description}
      headingScale={presentationScale}
      rhythm={rhythm}
      size={fieldSize}
      className="min-w-0 text-left"
    />
  )

  const toggleRow = (
    <div className="flex w-full min-w-0 items-start gap-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={fieldGroupLegendDisclosureTriggerVariants({ rhythm })}
      >
        <span className="flex w-full min-w-0 items-start gap-2">
          {headingInTrigger}
          <Icon
            name="chevron-down"
            size="lg"
            className={cn(
              'shrink-0 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
          />
        </span>
      </button>
      {legendAccessory ? <span className="shrink-0 pt-0.5">{legendAccessory}</span> : null}
    </div>
  )

  return (
    <legend className={legendClassName(legendChromeClassName, legendSrOnly)}>
      <div className={resolveFormSectionHeaderActionLayoutClasses({ hasStackedHint })}>
        <div className="min-w-0">{toggleRow}</div>
        {legendAction ? (
          <div className={formSectionHeaderActionSlotClasses}>{legendAction}</div>
        ) : null}
      </div>
    </legend>
  )
}

export function FieldGroupLegend({
  legend,
  legendSrOnly = false,
  description,
  legendAccessory,
  legendAction,
  legendSize,
  fieldSize = 'md',
  headingScale,
  legendChromeClassName,
  collapsible,
  rhythm = 'comfortable',
  open,
  onToggle,
}: FieldGroupLegendProps) {
  const presentationScale = resolveEffectiveFormHeaderScaleFromLegendSize({
    legendSize,
    headingScale,
  })

  if (!collapsible) {
    return (
      <StaticFieldGroupLegend
        legendChromeClassName={legendChromeClassName}
        legendSrOnly={legendSrOnly}
        presentationScale={presentationScale}
        rhythm={rhythm}
        fieldSize={fieldSize}
        legend={legend}
        description={description}
        legendAccessory={legendAccessory}
        legendAction={legendAction}
      />
    )
  }

  return (
    <CollapsibleFieldGroupLegend
      legendChromeClassName={legendChromeClassName}
      legendSrOnly={legendSrOnly}
      presentationScale={presentationScale}
      rhythm={rhythm}
      fieldSize={fieldSize}
      legend={legend}
      description={description}
      legendAccessory={legendAccessory}
      legendAction={legendAction}
      open={open}
      onToggle={onToggle}
    />
  )
}
