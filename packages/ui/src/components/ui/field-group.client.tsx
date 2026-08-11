'use client'

import type { Control, FieldValues } from 'react-hook-form'

import type { FieldSize } from './field.client'
import type { FieldGroupChrome } from './field-group-chrome.variants'
import { resolveFieldGroupChromeClassNames } from './field-group-chrome.variants'
import { resolveFieldGroupCollapseKey } from './field-group-collapse.lib'
import type { FieldGroupDisclosure } from './field-group-disclosure.types'
import { isSummaryDisclosure } from './field-group-disclosure.types'
import { FieldGroupSummaryRoute } from './field-group-summary-route.client'
import { StandardFieldGroupBody } from './field-group-standard-body.client'
import {
  fieldGroupLegendVariants,
  resolveArrayLegendScale,
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
   * typography (`sm` → `text-sm`; `md`/`lg` → `text-field-array-legend`).
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
  /** Required for `disclosure.variant: 'summary'`. */
  formControl?: Control<FieldValues>
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
  disclosure,
  uiStateKey,
  collapseKey,
  formControl,
  children,
}: FieldGroupProps) {
  const legendScale =
    legendSize === 'array'
      ? resolveArrayLegendScale(size ?? resolveFormDensity('compact').size)
      : 'default'
  const legendTypography = fieldGroupLegendVariants({ size: legendSize, scale: legendScale })
  const chromeClasses = resolveFieldGroupChromeClassNames(chrome, { rhythm })
  const resolvedCollapseKey = resolveFieldGroupCollapseKey({
    disclosure,
    collapseKey,
    id,
    legend,
  })

  if (disclosure && isSummaryDisclosure(disclosure)) {
    return (
      <FieldGroupSummaryRoute
        id={id}
        legend={legend}
        rhythm={rhythm}
        className={className}
        uiStateKey={uiStateKey}
        collapseKey={resolvedCollapseKey}
        chromeClasses={chromeClasses}
        disclosure={disclosure}
        formControl={formControl}
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
