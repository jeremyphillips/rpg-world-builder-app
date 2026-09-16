'use client'

import type { Control, FieldValues } from 'react-hook-form'

import type { FieldSize } from './field.client'
import type { FieldChrome } from './field-chrome.variants'
import type { FieldGroupChrome } from './field-group-chrome.variants'
import { resolveFieldGroupChromeClassNames } from './field-group-chrome.variants'
import { resolveFieldGroupCollapseKey } from './field-group-collapse.lib'
import type { FieldGroupDisclosure } from './field-group-disclosure.types'
import { isDialogDisclosure, isInlineDisclosure } from './field-group-disclosure.types'
import { FieldGroupDialogRoute } from './field-group-dialog-route.client'
import { FieldGroupSummaryRoute } from './field-group-summary-route.client'
import { StandardFieldGroupBody } from './field-group-standard-body.client'
import {
  fieldGroupLegendVariants,
  resolveArrayLegendClassName,
  type FieldGroupLegendSize,
  type FieldRhythm,
} from './field.variants'
import { resolveFormDensity } from '../../form/form-density'

export type { FieldGroupLegendSize }

export interface FieldGroupProps {
  /** Group heading rendered as the fieldset legend. Omit for layout-only wrappers. */
  legend?: string
  /** Legend type scale — use `subsection` for nested groups, `array` for repeatable lists. */
  legendSize?: FieldGroupLegendSize
  /**
   * Control + label scale — when `legendSize="array"`, also drives array legend
   * typography (same tokens as leaf field labels).
   */
  size?: FieldSize
  /** Vertical gap between sibling fields — defaults to `comfortable` (`gap-6`). */
  rhythm?: FieldRhythm
  description?: string
  className?: string
  /** Optional DOM id on the fieldset — for in-page scroll anchors. */
  id?: string
  /** Visual treatment for the legend + field stack — variants are mutually exclusive. */
  chrome?: FieldGroupChrome
  /** Resolved field-container chrome for inline disclosure expanded panels. */
  fieldChrome?: FieldChrome
  /** Open/collapse and summary behavior for the group container. */
  disclosure?: FieldGroupDisclosure
  /**
   * Scopes persisted collapsible state to a stable form instance.
   * When omitted, collapse state is session-only.
   */
  uiStateKey?: string
  /**
   * Stable key for collapsible persistence — defaults to `id` or a slug of `legend`.
   */
  collapseKey?: string
  /** Required for `disclosure.variant: 'inline' | 'dialog'`. */
  formControl?: Control<FieldValues>
  /** Prefix for resolving `summaryDependsOn` paths inside array/nested scopes. */
  namePrefix?: string
  children: React.ReactNode
}

/**
 * Semantic grouping for related fields: a `<fieldset>` with a `<legend>`, which
 * screen readers announce as the group name for the controls inside.
 */
export function FieldGroup({
  legend,
  legendSize = 'section',
  size,
  rhythm = resolveFormDensity().rhythm,
  description,
  className,
  id,
  chrome,
  fieldChrome,
  disclosure,
  uiStateKey,
  collapseKey,
  formControl,
  namePrefix,
  children,
}: FieldGroupProps) {
  const resolvedFieldSize = size ?? resolveFormDensity('compact').size
  const legendTypography =
    legendSize === 'array'
      ? resolveArrayLegendClassName(resolvedFieldSize)
      : fieldGroupLegendVariants({ size: legendSize })
  const chromeClasses = resolveFieldGroupChromeClassNames(chrome, { rhythm })
  const resolvedCollapseKey = resolveFieldGroupCollapseKey({
    disclosure,
    collapseKey,
    id,
    legend,
  })

  if (disclosure && isDialogDisclosure(disclosure)) {
    return (
      <FieldGroupDialogRoute
        id={id}
        legend={legend}
        size={size}
        rhythm={rhythm}
        className={className}
        collapseKey={resolvedCollapseKey}
        disclosure={disclosure}
        formControl={formControl}
        namePrefix={namePrefix}
      >
        {children}
      </FieldGroupDialogRoute>
    )
  }

  if (disclosure && isInlineDisclosure(disclosure)) {
    return (
      <FieldGroupSummaryRoute
        id={id}
        legend={legend}
        size={size}
        rhythm={rhythm}
        className={className}
        uiStateKey={uiStateKey}
        collapseKey={resolvedCollapseKey}
        chromeClasses={chromeClasses}
        fieldChrome={fieldChrome}
        disclosure={disclosure}
        formControl={formControl}
        namePrefix={namePrefix}
      >
        {children}
      </FieldGroupSummaryRoute>
    )
  }

  return (
    <StandardFieldGroupBody
      id={id}
      legend={legend}
      description={description}
      legendSize={legendSize}
      legendTypography={legendTypography}
      rhythm={rhythm}
      className={className}
      uiStateKey={uiStateKey}
      collapseKey={resolvedCollapseKey}
      chromeClasses={chromeClasses}
      disclosure={disclosure}
    >
      {children}
    </StandardFieldGroupBody>
  )
}
