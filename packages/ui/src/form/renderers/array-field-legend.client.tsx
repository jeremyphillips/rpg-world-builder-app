'use client'

import type { ReactNode } from 'react'

import {
  arrayFieldLegendInlineLabelClasses,
  arrayFieldLegendInlineLayoutClasses,
  resolveFieldGroupLegendClassName,
  type FieldGroupLegendSize,
} from '../../components/ui/field.variants'
import { cn } from '../../lib/utils'
import type { ArrayAddActionLayout } from '../field-config'
import { ArrayLegendIssueLink } from './array-item-issue.client'

export interface ArrayFieldLegendProps {
  legend: string
  legendSize: FieldGroupLegendSize
  legendScale: 'default' | 'sm'
  addActionLayout: ArrayAddActionLayout
  arrayIssueCount: number
  invalidRowCount: number
  onFocusFirstArrayIssue: () => void
  addControl?: ReactNode
}

/** Array section `<legend>` — optional inline add action on the right. */
export function ArrayFieldLegend({
  legend,
  legendSize,
  legendScale,
  addActionLayout,
  arrayIssueCount,
  invalidRowCount,
  onFocusFirstArrayIssue,
  addControl,
}: ArrayFieldLegendProps) {
  const legendClassName = resolveFieldGroupLegendClassName({
    size: legendSize,
    scale: legendScale,
  })

  if (addActionLayout === 'inline') {
    return (
      <legend className={cn(legendClassName, arrayFieldLegendInlineLayoutClasses)}>
        <span className={arrayFieldLegendInlineLabelClasses}>
          <span>{legend}</span>
          <ArrayLegendIssueLink
            issueCount={arrayIssueCount}
            invalidRowCount={invalidRowCount}
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
      {legend}
      <ArrayLegendIssueLink
        issueCount={arrayIssueCount}
        invalidRowCount={invalidRowCount}
        sectionLabel={legend}
        onPress={onFocusFirstArrayIssue}
      />
    </legend>
  )
}
