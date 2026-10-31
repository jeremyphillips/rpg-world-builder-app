'use client'

import type { ReactNode } from 'react'

import type { FieldSizeToken } from '../../../components/ui/field-sizing.variants'
import { cn } from '../../../lib/utils'
import type { ArrayAddActionLayout, FieldHintConfig } from '../../field-config'
import type { ArrayLabelMode } from '../../config/array/resolve-array-label.lib'
import { ArrayLikeSectionHeader } from '../../presentation/array-like-section-header.client'
import { ArrayLegendIssueLink } from './array-item-issue.client'

export interface ArrayFieldSectionHeaderProps {
  labelMode: ArrayLabelMode
  sectionLabel: string
  hint?: string | FieldHintConfig
  legendFieldSize: FieldSizeToken
  addActionLayout: ArrayAddActionLayout
  required?: boolean
  arrayIssueCount: number
  invalidRowCount: number
  hasContainerIssue?: boolean
  onFocusFirstArrayIssue: () => void
  addControl?: ReactNode
}

function resolveVisibleHeaderChrome(props: ArrayFieldSectionHeaderProps): {
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

function hasVisibleHeaderBand(
  props: ArrayFieldSectionHeaderProps,
  inlineAction: ReactNode | undefined,
): boolean {
  if (props.labelMode === 'visible') return true
  if (props.hint) return true
  if (inlineAction) return true
  if (props.required) return true
  if (props.arrayIssueCount > 0 || props.hasContainerIssue) return true
  return false
}

/** Array fieldset section header — semantic legend, visible label/hint, and renderer chrome. */
export function ArrayFieldSectionHeader(props: ArrayFieldSectionHeaderProps) {
  const { labelMode, sectionLabel, hint, legendFieldSize, required } = props
  const { labelAccessory, inlineAction } = resolveVisibleHeaderChrome(props)

  if (labelMode === 'anonymous') {
    if (!hasVisibleHeaderBand(props, inlineAction)) return null
    return (
      <div className="w-full min-w-0">
        <ArrayLikeSectionHeader
          label={sectionLabel}
          hint={hint}
          size={legendFieldSize}
          action={inlineAction}
          labelAccessory={labelAccessory}
          required={required}
          showVisibleLabel={false}
          wrapper="none"
        />
      </div>
    )
  }

  if (labelMode === 'srOnly') {
    return (
      <>
        <legend className="sr-only">{sectionLabel}</legend>
        {hasVisibleHeaderBand(props, inlineAction) ? (
          <div className="w-full min-w-0">
            <ArrayLikeSectionHeader
              label={sectionLabel}
              hint={hint}
              size={legendFieldSize}
              action={inlineAction}
              labelAccessory={labelAccessory}
              required={required}
              showVisibleLabel={false}
              wrapper="none"
            />
          </div>
        ) : null}
      </>
    )
  }

  return (
    <ArrayLikeSectionHeader
      label={sectionLabel}
      hint={hint}
      size={legendFieldSize}
      action={inlineAction}
      labelAccessory={labelAccessory}
      required={required}
      wrapper="legend"
    />
  )
}
