'use client'

import type { ReactNode } from 'react'

import type { FieldSizeToken } from '../../../components/ui/field-sizing.variants'
import { FieldLabelContent } from '../../../components/ui/field-label-content'
import { shouldShowVisibleRequiredMarker } from '../../../components/ui/field-required.lib'
import {
  arrayFieldLegendInlineLabelClasses,
  arrayFieldLegendInlineLayoutClasses,
  resolveArrayLegendClassName,
} from '../../../components/ui/field.variants'
import { cn } from '../../../lib/utils'
import type { ArrayAddActionLayout } from '../../field-config'
import { ArrayLegendIssueLink } from './array-item-issue.client'

export interface ArrayFieldLegendProps {
  legend: string
  legendFieldSize: FieldSizeToken
  addActionLayout: ArrayAddActionLayout
  required?: boolean
  arrayIssueCount: number
  invalidRowCount: number
  hasContainerIssue?: boolean
  onFocusFirstArrayIssue: () => void
  addControl?: ReactNode
}

/** Array section `<legend>` — optional inline add action on the right. */
export function ArrayFieldLegend({
  legend,
  legendFieldSize,
  addActionLayout,
  required = false,
  arrayIssueCount,
  invalidRowCount,
  hasContainerIssue = false,
  onFocusFirstArrayIssue,
  addControl,
}: ArrayFieldLegendProps) {
  const legendClassName = resolveArrayLegendClassName(legendFieldSize)
  const legendLabel = (
    <FieldLabelContent
      label={legend}
      required={required}
      showRequiredMarker={shouldShowVisibleRequiredMarker(required, 'visible')}
    />
  )

  if (addActionLayout === 'inline') {
    return (
      <legend className={cn(legendClassName, arrayFieldLegendInlineLayoutClasses)}>
        <span className={arrayFieldLegendInlineLabelClasses}>
          <span>{legendLabel}</span>
          <ArrayLegendIssueLink
            issueCount={arrayIssueCount}
            invalidRowCount={invalidRowCount}
            hasContainerIssue={hasContainerIssue}
            sectionLabel={legend}
            onPress={onFocusFirstArrayIssue}
          />
        </span>
        {addControl}
      </legend>
    )
  }

  return (
    <legend className={legendClassName}>
      <span className={arrayFieldLegendInlineLabelClasses}>
        {legendLabel}
        <ArrayLegendIssueLink
          issueCount={arrayIssueCount}
          invalidRowCount={invalidRowCount}
          hasContainerIssue={hasContainerIssue}
          sectionLabel={legend}
          onPress={onFocusFirstArrayIssue}
        />
      </span>
    </legend>
  )
}
