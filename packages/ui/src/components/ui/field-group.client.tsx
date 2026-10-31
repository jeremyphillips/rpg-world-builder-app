'use client'

import type { ReactNode } from 'react'
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
  fieldLabelTypographyVariants,
  type FieldGroupLegendSize,
  type FieldRhythm,
  type GroupHeadingScale,
} from './field.variants'
import { resolveFormDensity } from '../../form/form-density'

export type { FieldGroupLegendSize, GroupHeadingScale }

export interface FieldGroupProps {
  /** Group heading rendered as the fieldset legend. Omit for layout-only wrappers. */
  legend?: string
  /** Keep the legend as the group name without showing it. */
  legendSrOnly?: boolean
  /** Non-interactive status beside the legend label (badges, static text). */
  legendAccessory?: ReactNode
  /** Trailing header action aligned to the legend row end (compact inline controls). */
  legendAction?: ReactNode
  /** Legend type scale — use `subsection` for nested named groups. */
  legendSize?: FieldGroupLegendSize
  /**
   * When `'field'`, legend and description use the field label and hint type scale
   * for `size`. Replaces structural legend type. Spacing uses field anatomy stack on
   * the fieldset; structural legend→body margins stay on `legendSize` only.
   */
  headingScale?: GroupHeadingScale
  /** Control + label scale — drives field label typography when `headingScale="field"`. */
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
  legendSrOnly = false,
  legendAccessory,
  legendAction,
  legendSize = 'section',
  headingScale,
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
    headingScale === 'field'
      ? fieldLabelTypographyVariants({ size: resolvedFieldSize })
      : fieldGroupLegendVariants({ size: legendSize, rhythm })
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
      legendSrOnly={legendSrOnly}
      description={description}
      legendAccessory={legendAccessory}
      legendAction={legendAction}
      legendSize={legendSize}
      headingScale={headingScale}
      legendTypography={legendTypography}
      fieldSize={resolvedFieldSize}
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
