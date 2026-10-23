'use client'
import { Icon } from './icon/icon'

import { cn } from '../../lib/utils'
import {
  formSectionHeaderActionSlotClasses,
  formSectionHeaderLabelRowClasses,
  resolveFormSectionHeaderActionLayoutClasses,
} from '../../form/presentation/form-section-header.variants'
import {
  fieldGroupLegendDisclosureTriggerVariants,
  fieldGroupLegendHeaderStackVariants,
  resolveFieldGroupDescriptionTypography,
  type FieldRhythm,
} from './field.variants'
import { Text } from './text'

const legendChromeClasses = 'w-full min-w-0'

export type FieldGroupLegendProps = {
  legend: string
  description?: string
  /** Non-interactive status/decoration beside the legend label (group headings only). */
  legendAccessory?: React.ReactNode
  /** Trailing compact inline action on the legend row end. */
  legendAction?: React.ReactNode
  /** Resolved title scale — applied to the label only, not the `<legend>` wrapper. */
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
  hasStackedHint,
  children,
}: {
  action?: React.ReactNode
  hasStackedHint: boolean
  children: React.ReactNode
}) {
  if (!action) {
    return <>{children}</>
  }

  return (
    <div className={resolveFormSectionHeaderActionLayoutClasses({ hasStackedHint })}>
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
  legendTypography: string
  descriptionTypography: string
}

function resolveLegendPrimaryLabel(options: LegendContentOptions): React.ReactNode {
  const { legend, legendAccessory, collapsible } = options
  if (collapsible) {
    return legend
  }
  return <LegendLabelRow legend={legend} accessory={legendAccessory} />
}

function LegendTitle({ typography, children }: { typography: string; children: React.ReactNode }) {
  return <span className={typography}>{children}</span>
}

function resolveLegendContent(options: LegendContentOptions): React.ReactNode {
  const { description, rhythm, legendTypography, descriptionTypography } = options
  const title = (
    <LegendTitle typography={legendTypography}>{resolveLegendPrimaryLabel(options)}</LegendTitle>
  )

  if (!description) {
    return title
  }

  return (
    <span className={fieldGroupLegendHeaderStackVariants({ rhythm })}>
      {title}
      <Text as="span" className={descriptionTypography}>
        {description}
      </Text>
    </span>
  )
}

function StaticFieldGroupLegend({
  legendChromeClassName,
  legendContent,
  legendAction,
  hasStackedHint,
}: {
  legendChromeClassName: string
  legendContent: React.ReactNode
  legendAction?: React.ReactNode
  hasStackedHint: boolean
}) {
  return (
    <legend className={cn(legendChromeClasses, legendChromeClassName)}>
      <LegendHeaderActionLayout action={legendAction} hasStackedHint={hasStackedHint}>
        {legendContent}
      </LegendHeaderActionLayout>
    </legend>
  )
}

function CollapsibleFieldGroupLegend({
  legendChromeClassName,
  legendContent,
  legendAccessory,
  legendAction,
  hasStackedHint,
  rhythm,
  open,
  onToggle,
}: {
  legendChromeClassName: string
  legendContent: React.ReactNode
  legendAccessory?: React.ReactNode
  legendAction?: React.ReactNode
  hasStackedHint: boolean
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
        <Icon
          name="chevron-down"
          size="lg"
          className="shrink-0 text-muted-foreground open && rotate-180"
        />
      </button>
      {legendAccessory ? <span className="shrink-0 pt-0.5">{legendAccessory}</span> : null}
    </div>
  )

  return (
    <legend className={cn(legendChromeClasses, legendChromeClassName)}>
      <LegendHeaderActionLayout action={legendAction} hasStackedHint={hasStackedHint}>
        {toggleRow}
      </LegendHeaderActionLayout>
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
  const descriptionTypography = resolveFieldGroupDescriptionTypography(rhythm)

  const contentOptions: LegendContentOptions = {
    legend,
    description,
    legendAccessory,
    collapsible,
    rhythm,
    legendTypography,
    descriptionTypography,
  }
  const legendContent = resolveLegendContent(contentOptions)
  const hasStackedHint = Boolean(description)

  if (!collapsible) {
    return (
      <StaticFieldGroupLegend
        legendChromeClassName={legendChromeClassName}
        legendContent={legendContent}
        legendAction={legendAction}
        hasStackedHint={hasStackedHint}
      />
    )
  }

  return (
    <CollapsibleFieldGroupLegend
      legendChromeClassName={legendChromeClassName}
      legendContent={legendContent}
      legendAccessory={legendAccessory}
      legendAction={legendAction}
      hasStackedHint={hasStackedHint}
      rhythm={rhythm}
      open={open}
      onToggle={onToggle}
    />
  )
}
