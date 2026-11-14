'use client'

import type { ReactNode } from 'react'

import type { FieldSizeToken } from '../../../components/ui/field-sizing.variants'
import {
  fieldSetInFlowLegendClasses,
  type FieldRhythm,
} from '../../../components/ui/field.variants'
import { cn } from '../../../lib/utils'
import type { ArrayAddActionLayout, FieldHintConfig } from '../../field-config'
import type { ArrayLabelMode } from '../../config/array/resolve-array-heading.lib'
import { FormSectionHeader } from '../../presentation/form-section-header.client'
import { ArrayLegendIssueLink } from './array-item-issue.client'

export interface ArraySectionHeaderProps {
  labelMode: ArrayLabelMode
  /** Gates visible chrome bands and fieldset anatomy stack — SSOT: resolveArrayShowSectionHeader. */
  showSectionHeader: boolean
  sectionLabel: string
  hint?: string | FieldHintConfig
  legendFieldSize: FieldSizeToken
  legendRhythm: FieldRhythm
  addActionLayout: ArrayAddActionLayout
  required?: boolean
  arrayIssueCount: number
  invalidRowCount: number
  hasContainerIssue?: boolean
  onFocusFirstArrayIssue: () => void
  addControl?: ReactNode
}

function resolveVisibleHeaderChrome(props: ArraySectionHeaderProps): {
  labelAccessory: ReactNode
  inlineAction: ReactNode | undefined
} {
  const inlineAction = props.addActionLayout === 'inline' ? props.addControl : undefined
  const labelAccessory = (
    <ArrayLegendIssueLink
      issueCount={props.arrayIssueCount}
      invalidRowCount={props.invalidRowCount}
      hasContainerIssue={props.hasContainerIssue}
      sectionLabel={props.sectionLabel}
      onPress={props.onFocusFirstArrayIssue}
    />
  )
  return { labelAccessory, inlineAction }
}

/** Array fieldset section header — semantic legend, visible label/hint, and renderer chrome. */
export function ArraySectionHeader(props: ArraySectionHeaderProps) {
  const {
    labelMode,
    showSectionHeader,
    sectionLabel,
    hint,
    legendFieldSize,
    legendRhythm,
    required,
  } = props
  const { labelAccessory, inlineAction } = resolveVisibleHeaderChrome(props)

  const fieldHeader = (
    <FormSectionHeader
      label={sectionLabel}
      hint={hint}
      headingScale="field"
      rhythm={legendRhythm}
      size={legendFieldSize}
      action={inlineAction}
      labelAccessory={labelAccessory}
      required={required}
    />
  )

  if (labelMode === 'anonymous') {
    if (!showSectionHeader) return null
    return (
      <div className="w-full min-w-0">
        <FormSectionHeader
          label={sectionLabel}
          hint={hint}
          headingScale="field"
          rhythm={legendRhythm}
          size={legendFieldSize}
          action={inlineAction}
          labelAccessory={labelAccessory}
          required={required}
          showVisibleLabel={false}
        />
      </div>
    )
  }

  if (labelMode === 'srOnly') {
    return (
      <>
        <legend className="sr-only">{sectionLabel}</legend>
        {showSectionHeader ? (
          <div className="w-full min-w-0">
            <FormSectionHeader
              label={sectionLabel}
              hint={hint}
              headingScale="field"
              rhythm={legendRhythm}
              size={legendFieldSize}
              action={inlineAction}
              labelAccessory={labelAccessory}
              required={required}
              showVisibleLabel={false}
            />
          </div>
        ) : null}
      </>
    )
  }

  return (
    <legend className={cn(fieldSetInFlowLegendClasses, 'w-full min-w-0')}>{fieldHeader}</legend>
  )
}
