'use client'

import type { ReactNode } from 'react'

import { FieldGroupLegendHint } from '../../../components/ui/field-group-legend-hint.client'
import type { FieldSizeToken } from '../../../components/ui/field-sizing.variants'
import {
  fieldSetInFlowLegendClasses,
  type FieldRhythm,
  type FormHeadingScale,
} from '../../../components/ui/field.variants'
import { cn } from '../../../lib/utils'
import {
  normalizeFieldHint,
  type ArrayAddActionLayout,
  type FieldHintConfig,
} from '../../field-config'
import type { ArrayLabelMode } from '../../config/array/resolve-array-heading.lib'
import { FormSectionHeader } from '../../presentation/form-section-header.client'
import { ArrayIssueLink } from './item/issues/array-item-issue.client'

export interface ArraySectionHeaderProps {
  labelMode: ArrayLabelMode
  /** Gates visible chrome bands and fieldset anatomy stack — SSOT: resolveArrayShowSectionHeader. */
  showSectionHeader: boolean
  sectionLabel: string
  hint?: string | FieldHintConfig
  /** Id for the hint sibling. The fieldset `aria-describedby` targets this node. */
  hintId?: string
  legendFieldSize: FieldSizeToken
  legendRhythm: FieldRhythm
  headingScale?: FormHeadingScale
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
    <ArrayIssueLink
      issueCount={props.arrayIssueCount}
      invalidRowCount={props.invalidRowCount}
      hasContainerIssue={props.hasContainerIssue}
      sectionLabel={props.sectionLabel}
      onPress={props.onFocusFirstArrayIssue}
    />
  )
  return { labelAccessory, inlineAction }
}

function ArraySectionHint({
  hint,
  hintId,
  headingScale,
  rhythm,
  size,
}: {
  hint?: string | FieldHintConfig
  hintId?: string
  headingScale: FormHeadingScale
  rhythm: FieldRhythm
  size: FieldSizeToken
}) {
  const text = normalizeFieldHint(hint).text
  if (!text || !hintId) return null
  return (
    <FieldGroupLegendHint
      hint={text}
      hintId={hintId}
      headingScale={headingScale}
      rhythm={rhythm}
      size={size}
    />
  )
}

/** Array fieldset section header — legend name, hint description, and renderer chrome. */
export function ArraySectionHeader(props: ArraySectionHeaderProps) {
  const {
    labelMode,
    showSectionHeader,
    sectionLabel,
    hint,
    hintId,
    legendFieldSize,
    legendRhythm,
    headingScale = 'field',
    required,
  } = props
  const { labelAccessory, inlineAction } = resolveVisibleHeaderChrome(props)
  const hintNode = (
    <ArraySectionHint
      hint={hint}
      hintId={hintId}
      headingScale={headingScale}
      rhythm={legendRhythm}
      size={legendFieldSize}
    />
  )

  if (labelMode === 'anonymous') {
    if (!showSectionHeader) return null
    return (
      <div className="w-full min-w-0">
        <FormSectionHeader
          label={sectionLabel}
          headingScale={headingScale}
          rhythm={legendRhythm}
          size={legendFieldSize}
          action={inlineAction}
          labelAccessory={labelAccessory}
          required={required}
          showVisibleLabel={false}
        />
        {hintNode}
      </div>
    )
  }

  const nameHeader = (
    <FormSectionHeader
      label={sectionLabel}
      headingScale={headingScale}
      rhythm={legendRhythm}
      size={legendFieldSize}
      action={inlineAction}
      labelAccessory={labelAccessory}
      required={required}
      omitLabel={labelMode === 'srOnly'}
    />
  )

  if (labelMode === 'srOnly') {
    return (
      <>
        <legend className="sr-only">{sectionLabel}</legend>
        {showSectionHeader ? (
          <div className="w-full min-w-0">
            {nameHeader}
            {hintNode}
          </div>
        ) : null}
      </>
    )
  }

  return (
    <>
      <legend className={cn(fieldSetInFlowLegendClasses, 'w-full min-w-0')}>{nameHeader}</legend>
      {hintNode}
    </>
  )
}
