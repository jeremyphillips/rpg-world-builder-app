'use client'

import type { ReactNode } from 'react'

import type { FieldSizeToken } from '../../../components/ui/field-sizing.variants'
import { cn } from '../../../lib/utils'
import { resolveArrayLegendClassName } from '../../../components/ui/field.variants'
import type { ArrayAddActionLayout, FieldHintConfig } from '../../field-config'
import { FormSectionHeader } from '../../presentation/form-section-header.client'
import { ArrayLegendIssueLink } from './array-item-issue.client'

export interface ArrayFieldLegendProps {
  legend: string
  headingHint?: string | FieldHintConfig
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
  headingHint,
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
  const inlineAction = addActionLayout === 'inline' ? addControl : undefined

  return (
    <legend className={cn(legendClassName, 'w-full min-w-0')}>
      <FormSectionHeader
        label={legend}
        hint={headingHint}
        labelPresentation="field-label"
        required={required}
        action={inlineAction}
        labelAccessory={
          <ArrayLegendIssueLink
            issueCount={arrayIssueCount}
            invalidRowCount={invalidRowCount}
            hasContainerIssue={hasContainerIssue}
            sectionLabel={legend}
            onPress={onFocusFirstArrayIssue}
          />
        }
      />
    </legend>
  )
}
