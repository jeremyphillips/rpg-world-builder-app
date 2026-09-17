'use client'

import type { ReactNode } from 'react'

import type { FieldSizeToken } from '../../../components/ui/field-sizing.variants'
import type { ArrayAddActionLayout, FieldHintConfig } from '../../field-config'
import { ArrayLikeSectionHeader } from '../../presentation/array-like-section-header.client'
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
  const inlineAction = addActionLayout === 'inline' ? addControl : undefined

  return (
    <ArrayLikeSectionHeader
      label={legend}
      hint={headingHint}
      size={legendFieldSize}
      action={inlineAction}
      required={required}
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
  )
}
