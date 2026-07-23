'use client'

import type { Control, FieldValues } from 'react-hook-form'

import { slugifyGroupCollapseKey } from '../../form/config/group-collapse-storage.lib'
import type { FieldSize } from './field.client'
import type { FieldGroupFieldsChrome } from './field-group-chrome.variants'
import { resolveFieldGroupChromeClassNames } from './field-group-chrome.variants'
import { StandardFieldGroupBody } from './field-group-standard-body.client'
import { SummaryDisclosureFieldGroupShell } from './field-group-summary-disclosure-shell.client'
import {
  DEFAULT_ARRAY_SECTION_SIZE,
  DEFAULT_FORM_RHYTHM,
  fieldGroupLegendVariants,
  resolveArrayLegendScale,
  type FieldGroupLegendSize,
  type FieldStackRhythm,
} from './field.variants'

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
  /** Required for `fieldsChrome.variant: 'summaryDisclosure'`. */
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
  rhythm = DEFAULT_FORM_RHYTHM,
  description,
  className,
  id,
  fieldsChrome,
  uiStateKey,
  collapseKey,
  formControl,
  children,
}: FieldGroupProps) {
  const legendScale =
    legendSize === 'array' ? resolveArrayLegendScale(size ?? DEFAULT_ARRAY_SECTION_SIZE) : 'default'
  const legendTypography = fieldGroupLegendVariants({ size: legendSize, scale: legendScale })
  const chromeClasses = resolveFieldGroupChromeClassNames(fieldsChrome)
  const resolvedCollapseKey =
    collapseKey ??
    id ??
    (legend ? slugifyGroupCollapseKey(legend) || 'group-section' : 'group-section')

  if (chromeClasses.isSummaryDisclosure) {
    if (!legend) {
      throw new Error('FieldGroup summaryDisclosure chrome requires a legend.')
    }
    if (!formControl) {
      throw new Error('FieldGroup summaryDisclosure chrome requires formControl from FormProvider.')
    }

    return (
      <SummaryDisclosureFieldGroupShell
        id={id}
        legend={legend}
        rhythm={rhythm}
        className={className}
        uiStateKey={uiStateKey}
        collapseKey={resolvedCollapseKey}
        chromeClasses={chromeClasses}
        formControl={formControl}
      >
        {children}
      </SummaryDisclosureFieldGroupShell>
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
    >
      {children}
    </StandardFieldGroupBody>
  )
}
