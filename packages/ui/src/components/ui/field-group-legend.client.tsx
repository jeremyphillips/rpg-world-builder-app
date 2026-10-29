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
  type GroupHeadingScale,
} from './field.variants'
import { Text } from './text'

const legendChromeClasses = 'w-full min-w-0'

export type FieldGroupLegendProps = {
  legend: string
  legendSrOnly?: boolean
  description?: string
  /** Non-interactive status/decoration beside the legend label (group headings only). */
  legendAccessory?: React.ReactNode
  /** Trailing compact inline action on the legend row end. */
  legendAction?: React.ReactNode
  /** Resolved title scale — applied to the label only, not the `<legend>` wrapper. */
  legendTypography: string
  /** When `'field'`, description uses field-hint type instead of group description type. */
  headingScale?: GroupHeadingScale
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
  headingScale?: GroupHeadingScale
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
  const { description, rhythm, legendTypography, descriptionTypography, headingScale } = options
  const title = (
    <LegendTitle typography={legendTypography}>{resolveLegendPrimaryLabel(options)}</LegendTitle>
  )

  if (!description) {
    return title
  }

  return (
    <span className={fieldGroupLegendHeaderStackVariants({ rhythm })}>
      {title}
      <Text
        as="span"
        variant={headingScale === 'field' ? 'caption' : undefined}
        className={headingScale === 'field' ? undefined : descriptionTypography}
      >
        {description}
      </Text>
    </span>
  )
}

function legendClassName(legendChromeClassName: string, legendSrOnly: boolean): string {
  if (legendSrOnly) return 'sr-only'
  return cn(legendChromeClasses, legendChromeClassName)
}

function StaticFieldGroupLegend({
  legendChromeClassName,
  legendSrOnly,
  legendContent,
  legendAction,
  hasStackedHint,
}: {
  legendChromeClassName: string
  legendSrOnly: boolean
  legendContent: React.ReactNode
  legendAction?: React.ReactNode
  hasStackedHint: boolean
}) {
  return (
    <legend className={legendClassName(legendChromeClassName, legendSrOnly)}>
      <LegendHeaderActionLayout action={legendAction} hasStackedHint={hasStackedHint}>
        {legendContent}
      </LegendHeaderActionLayout>
    </legend>
  )
}

function CollapsibleFieldGroupLegend({
  legendChromeClassName,
  legendSrOnly,
  legendContent,
  legendAccessory,
  legendAction,
  hasStackedHint,
  rhythm,
  open,
  onToggle,
}: {
  legendChromeClassName: string
  legendSrOnly: boolean
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
    <legend className={legendClassName(legendChromeClassName, legendSrOnly)}>
      <LegendHeaderActionLayout action={legendAction} hasStackedHint={hasStackedHint}>
        {toggleRow}
      </LegendHeaderActionLayout>
    </legend>
  )
}

export function FieldGroupLegend({
  legend,
  legendSrOnly = false,
  description,
  legendAccessory,
  legendAction,
  legendTypography,
  headingScale,
  legendChromeClassName,
  collapsible,
  rhythm = 'comfortable',
  open,
  onToggle,
}: FieldGroupLegendProps) {
  const descriptionTypography = resolveFieldGroupDescriptionTypography(rhythm, headingScale)

  const contentOptions: LegendContentOptions = {
    legend,
    description,
    legendAccessory,
    collapsible,
    rhythm,
    legendTypography,
    descriptionTypography,
    headingScale,
  }
  const legendContent = resolveLegendContent(contentOptions)
  const hasStackedHint = Boolean(description)

  if (!collapsible) {
    return (
      <StaticFieldGroupLegend
        legendChromeClassName={legendChromeClassName}
        legendSrOnly={legendSrOnly}
        legendContent={legendContent}
        legendAction={legendAction}
        hasStackedHint={hasStackedHint}
      />
    )
  }

  return (
    <CollapsibleFieldGroupLegend
      legendChromeClassName={legendChromeClassName}
      legendSrOnly={legendSrOnly}
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
