'use client'
import { Icon } from './icon/icon'

import { cn } from '../../lib/utils'
import { FormSectionHeader } from '../../form/presentation/form-section-header.client'
import {
  fieldGroupLegendDisclosureTriggerVariants,
  type FieldGroupLegendSize,
  type FieldRhythm,
  type FormHeadingScale,
} from './field.variants'
import type { FieldSize } from './field.client'
import { resolveEffectiveFormHeaderScaleFromLegendSize } from '../../form/presentation/form-header-stack-typography.lib'
import {
  formSectionHeaderActionSlotClasses,
  resolveFormSectionHeaderActionLayoutClasses,
} from '../../form/presentation/form-section-header.variants'
import { FieldGroupLegendHint } from './field-group-legend-hint.client'

const legendChromeClasses = 'w-full min-w-0'

export type FieldGroupLegendProps = {
  legend: string
  legendSrOnly?: boolean
  hint?: string
  hintId?: string
  /** Non-interactive status/decoration beside the legend label (group headings only). */
  legendAccessory?: React.ReactNode
  /** Trailing compact inline action on the legend row end. */
  legendAction?: React.ReactNode
  legendSize: FieldGroupLegendSize
  fieldSize?: FieldSize
  headingScale?: FormHeadingScale
  legendChromeClassName: string
  hintMarginClass?: string
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
  hint,
  hintId,
  legendAccessory,
  legendAction,
  hintMarginClass,
}: {
  legendChromeClassName: string
  legendSrOnly: boolean
  presentationScale: ReturnType<typeof resolveEffectiveFormHeaderScaleFromLegendSize>
  rhythm: FieldRhythm
  fieldSize: FieldSize
  legend: string
  hint?: string
  hintId?: string
  legendAccessory?: React.ReactNode
  legendAction?: React.ReactNode
  hintMarginClass?: string
}) {
  return (
    <>
      <legend className={legendClassName(legendChromeClassName, legendSrOnly)}>
        <FormSectionHeader
          label={legend}
          headingScale={presentationScale}
          rhythm={rhythm}
          size={fieldSize}
          labelAccessory={legendAccessory}
          action={legendAction}
        />
      </legend>
      {hint && hintId ? (
        <FieldGroupLegendHint
          hint={hint}
          hintId={hintId}
          headingScale={presentationScale}
          rhythm={rhythm}
          size={fieldSize}
          className={hintMarginClass}
        />
      ) : null}
    </>
  )
}

function CollapsibleFieldGroupLegend({
  legendChromeClassName,
  legendSrOnly,
  presentationScale,
  rhythm,
  fieldSize,
  legend,
  hint,
  hintId,
  legendAccessory,
  legendAction,
  hintMarginClass,
  open,
  onToggle,
}: {
  legendChromeClassName: string
  legendSrOnly: boolean
  presentationScale: ReturnType<typeof resolveEffectiveFormHeaderScaleFromLegendSize>
  rhythm: FieldRhythm
  fieldSize: FieldSize
  legend: string
  hint?: string
  hintId?: string
  legendAccessory?: React.ReactNode
  legendAction?: React.ReactNode
  hintMarginClass?: string
  open?: boolean
  onToggle?: () => void
}) {
  const headingInTrigger = (
    <FormSectionHeader
      label={legend}
      headingScale={presentationScale}
      rhythm={rhythm}
      size={fieldSize}
      className="min-w-0 text-left"
    />
  )

  const toggleRow = (
    <div className={cn('flex w-full min-w-0 gap-2', 'items-center')}>
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={fieldGroupLegendDisclosureTriggerVariants({ rhythm })}
      >
        <div className="min-w-0 flex-1">{headingInTrigger}</div>
        <Icon
          name="chevron-down"
          size="lg"
          className={cn(
            'shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {legendAccessory ? <span className="shrink-0 pt-0.5">{legendAccessory}</span> : null}
    </div>
  )

  return (
    <>
      <legend className={legendClassName(legendChromeClassName, legendSrOnly)}>
        <div className={resolveFormSectionHeaderActionLayoutClasses({ hasStackedHint: false })}>
          <div className="min-w-0">{toggleRow}</div>
          {legendAction ? (
            <div className={formSectionHeaderActionSlotClasses}>{legendAction}</div>
          ) : null}
        </div>
      </legend>
      {hint && hintId ? (
        <FieldGroupLegendHint
          hint={hint}
          hintId={hintId}
          headingScale={presentationScale}
          rhythm={rhythm}
          size={fieldSize}
          className={hintMarginClass}
        />
      ) : null}
    </>
  )
}

export function FieldGroupLegend({
  legend,
  legendSrOnly = false,
  hint,
  hintId,
  legendAccessory,
  legendAction,
  legendSize,
  fieldSize = 'md',
  headingScale,
  legendChromeClassName,
  hintMarginClass,
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
        hint={hint}
        hintId={hintId}
        legendAccessory={legendAccessory}
        legendAction={legendAction}
        hintMarginClass={hintMarginClass}
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
      hint={hint}
      hintId={hintId}
      legendAccessory={legendAccessory}
      legendAction={legendAction}
      hintMarginClass={hintMarginClass}
      open={open}
      onToggle={onToggle}
    />
  )
}
