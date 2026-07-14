'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  readGroupCollapseOpen,
  slugifyGroupCollapseKey,
  writeGroupCollapseOpen,
} from '../../form/config/group-collapse-storage.lib'
import { accordionContentVariants, accordionTriggerVariants } from './accordion.variants'
import { Collapsible, CollapsibleContent } from './collapsible.client'
import type { FieldSize } from './field.client'
import type { FieldGroupFieldsChrome } from './field-group-chrome.variants'
import { resolveFieldGroupChromeClassNames } from './field-group-chrome.variants'
import {
  DEFAULT_ARRAY_SECTION_SIZE,
  DEFAULT_FORM_RHYTHM,
  fieldGroupBottomMarginClasses,
  fieldGroupDescriptionTypographyClasses,
  fieldGroupLegendHeaderMarginVariants,
  fieldGroupLegendHeaderStackClasses,
  fieldGroupLegendVariants,
  fieldSetResetClasses,
  fieldStackRhythmVariants,
  resolveArrayLegendScale,
  type FieldGroupLegendSize,
  type FieldStackRhythm,
} from './field.variants'
import { Text } from './text'

export type { FieldGroupLegendSize }

export interface FieldGroupProps {
  /** Group heading rendered as the fieldset legend. */
  legend: string
  /** Legend type scale — use `subsection` for nested groups, `array` for repeatable lists. */
  legendSize?: FieldGroupLegendSize
  /**
   * Control + label scale — when `legendSize="array"`, also drives array legend
   * typography (`sm` → `text-sm`; `md`/`lg` → `text-field-array-legend`).
   */
  size?: FieldSize
  /** Vertical gap between sibling fields — defaults to `comfortable` (`gap-6`). */
  rhythm?: FieldStackRhythm
  description?: string
  className?: string
  /** Optional DOM id on the fieldset — for in-page scroll anchors. */
  id?: string
  /** Visual treatment for legend + field stack — variants are mutually exclusive. */
  fieldsChrome?: FieldGroupFieldsChrome
  /**
   * Scopes persisted collapsible state to a stable form instance.
   * When omitted, collapse state is session-only.
   */
  uiStateKey?: string
  /**
   * Stable key for collapsible persistence — defaults to `id` or a slug of `legend`.
   */
  collapseKey?: string
  children: React.ReactNode
}

function useGroupCollapseState(options: {
  collapseKey: string
  defaultOpen: boolean
  uiStateKey?: string
}): [boolean, (open: boolean) => void] {
  const [open, setOpen] = React.useState(() => {
    if (options.uiStateKey) {
      const stored = readGroupCollapseOpen(options.uiStateKey, options.collapseKey)
      if (stored !== undefined) return stored
    }
    return options.defaultOpen
  })

  const onOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next)
      if (options.uiStateKey) {
        writeGroupCollapseOpen(options.uiStateKey, options.collapseKey, next)
      }
    },
    [options.collapseKey, options.uiStateKey],
  )

  return [open, onOpenChange]
}

interface FieldGroupLegendProps {
  legend: string
  description?: string
  legendSize: FieldGroupLegendSize
  legendTypography: string
  legendChromeClassName: string
  collapsible: boolean
  open?: boolean
  onToggle?: () => void
}

function FieldGroupLegend({
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

/**
 * Semantic grouping for related fields: a `<fieldset>` with a `<legend>`, which
 * screen readers announce as the group name for the controls inside.
 */
export function FieldGroup({
  legend,
  legendSize = 'section',
  size,
  rhythm = DEFAULT_FORM_RHYTHM,
  description,
  className,
  id,
  fieldsChrome,
  uiStateKey,
  collapseKey,
  children,
}: FieldGroupProps) {
  const legendScale =
    legendSize === 'array' ? resolveArrayLegendScale(size ?? DEFAULT_ARRAY_SECTION_SIZE) : 'default'
  const legendTypography = fieldGroupLegendVariants({ size: legendSize, scale: legendScale })
  const chromeClasses = resolveFieldGroupChromeClassNames(fieldsChrome)
  const resolvedCollapseKey =
    collapseKey ?? id ?? (slugifyGroupCollapseKey(legend) || 'group-section')
  const [open, onOpenChange] = useGroupCollapseState({
    collapseKey: resolvedCollapseKey,
    defaultOpen: chromeClasses.defaultOpen,
    uiStateKey,
  })

  const fieldsetClassName = cn(
    fieldSetResetClasses,
    fieldGroupBottomMarginClasses,
    'min-w-0',
    chromeClasses.fieldset,
    className,
  )

  const body = (
    <div className={cn(fieldStackRhythmVariants({ rhythm }), chromeClasses.body)}>{children}</div>
  )

  const legendNode = (
    <FieldGroupLegend
      legend={legend}
      description={description}
      legendSize={legendSize}
      legendTypography={legendTypography}
      legendChromeClassName={chromeClasses.legend}
      collapsible={chromeClasses.isCollapsible}
      open={open}
      onToggle={() => onOpenChange(!open)}
    />
  )

  return (
    <fieldset id={id} className={fieldsetClassName}>
      {legendNode}
      {chromeClasses.isCollapsible ? (
        <Collapsible open={open} onOpenChange={onOpenChange} className="min-w-0">
          <CollapsibleContent forceMount className={accordionContentVariants()}>
            {body}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        body
      )}
    </fieldset>
  )
}
