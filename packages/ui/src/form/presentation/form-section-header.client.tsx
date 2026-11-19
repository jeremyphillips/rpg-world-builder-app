'use client'

import type { ReactNode } from 'react'

import type { FieldSize } from '../../components/ui/field.client'
import { FieldLabelContent } from '../../components/ui/field-label-content'
import { resolveOwnedLabelPolicy } from '../../components/ui/field-required.lib'
import {
  fieldLabelVariants,
  type FieldRhythm,
  type FormHeadingScale,
} from '../../components/ui/field.variants'
import { cn } from '../../lib/utils'
import type { FieldHintConfig } from '../field-config'
import { normalizeFieldHint } from '../field-config'
import { useFormSectionContext } from '../context/form-section.context'
import type { FormDensity } from '../form-density'
import { resolveFormHeaderStackTypography } from './form-header-stack-typography.lib'
import { resolveFormSectionHeaderPresentation } from './resolve-form-section-header-presentation.lib'
import {
  formSectionHeaderActionSlotClasses,
  formSectionHeaderLabelRowClasses,
  resolveFormSectionHeaderActionLayoutClasses,
} from './form-section-header.variants'

export interface FormSectionHeaderProps {
  label: string
  hint?: string | FieldHintConfig
  headingScale: FormHeadingScale
  density?: FormDensity
  rhythm?: FieldRhythm
  size?: FieldSize
  action?: ReactNode
  /** Required markers, issue links, and similar accessories on the label line. */
  labelAccessory?: ReactNode
  required?: boolean
  /** When false, omit the visible label line. Hint and accessories remain. */
  showVisibleLabel?: boolean
  /**
   * The accessible name is owned by another element (for example a fieldset legend).
   * Renders accessories and hint only — no second copy of the label text.
   */
  omitLabel?: boolean
  className?: string
  id?: string
}

function hasStackedHint(hint: string | FieldHintConfig | undefined): boolean {
  if (!hint) return false
  return Boolean(normalizeFieldHint(hint).text)
}

function renderFormSectionHint(
  hint: string | FieldHintConfig | undefined,
  hintClass: string,
): ReactNode {
  if (!hint) return null
  const normalized = normalizeFieldHint(hint)
  if (!normalized.text) return null
  return <span className={hintClass}>{normalized.text}</span>
}

function renderHeadingBlock({
  label,
  hint,
  headingScale,
  rhythm,
  size,
  labelAccessory,
  required,
  id,
  showVisibleLabel = true,
  omitLabel = false,
}: FormSectionHeaderProps & { rhythm: FieldRhythm; size: FieldSize }): ReactNode {
  const stackTypography = resolveFormHeaderStackTypography({
    headingScale,
    rhythm,
    size,
  })
  const hintNode = renderFormSectionHint(hint, stackTypography.hintClass)

  let labelLine: ReactNode = null

  if (omitLabel) {
    labelLine = labelAccessory ? (
      <div className={formSectionHeaderLabelRowClasses}>{labelAccessory}</div>
    ) : null
  } else if (headingScale === 'field') {
    const fieldLabelVisibility = showVisibleLabel ? 'visible' : 'srOnly'
    const { showRequiredMarker, nameClassName } = resolveOwnedLabelPolicy(
      required,
      fieldLabelVisibility,
    )
    if (showVisibleLabel) {
      labelLine = (
        <div className={formSectionHeaderLabelRowClasses}>
          <span className={fieldLabelVariants({ size })}>
            <FieldLabelContent label={label} showRequiredMarker={showRequiredMarker} />
          </span>
          {labelAccessory}
        </div>
      )
    } else {
      const srOnlyLabel = (
        <span className={cn(fieldLabelVariants({ size }), nameClassName)}>
          <FieldLabelContent label={label} showRequiredMarker={showRequiredMarker} />
        </span>
      )
      labelLine = labelAccessory ? (
        <div className={formSectionHeaderLabelRowClasses}>
          {srOnlyLabel}
          {labelAccessory}
        </div>
      ) : (
        srOnlyLabel
      )
    }
  } else if (showVisibleLabel) {
    labelLine = (
      <div className={formSectionHeaderLabelRowClasses}>
        <span className={stackTypography.labelClass}>{label}</span>
        {labelAccessory}
      </div>
    )
  } else if (labelAccessory) {
    labelLine = <div className={formSectionHeaderLabelRowClasses}>{labelAccessory}</div>
  }

  if (hintNode) {
    return (
      <div id={id} className={cn(stackTypography.labelHintStackClass, 'min-w-0')}>
        {labelLine}
        {hintNode}
      </div>
    )
  }

  if (!labelLine) return null

  return <div id={id}>{labelLine}</div>
}

/** Form section heading — label + optional hint with an optional trailing action. */
export function FormSectionHeader({
  label,
  hint,
  headingScale,
  density,
  rhythm: rhythmOverride,
  size: sizeOverride,
  action,
  labelAccessory,
  required,
  showVisibleLabel = true,
  omitLabel = false,
  className,
  id,
}: FormSectionHeaderProps) {
  const { density: inheritedDensity } = useFormSectionContext()
  const { rhythm, size } = resolveFormSectionHeaderPresentation({
    density,
    rhythm: rhythmOverride,
    size: sizeOverride,
    inheritedDensity,
  })

  const headingBlock = renderHeadingBlock({
    label,
    hint,
    headingScale,
    labelAccessory,
    required,
    id,
    showVisibleLabel,
    omitLabel,
    rhythm,
    size,
  })

  if (!headingBlock) {
    return null
  }

  if (!action) {
    return <div className={className}>{headingBlock}</div>
  }

  const stackedHint = hasStackedHint(hint)

  return (
    <div
      className={cn(
        resolveFormSectionHeaderActionLayoutClasses({ hasStackedHint: stackedHint }),
        className,
      )}
    >
      {headingBlock}
      <div className={formSectionHeaderActionSlotClasses}>{action}</div>
    </div>
  )
}
