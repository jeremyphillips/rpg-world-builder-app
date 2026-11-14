'use client'

import type { ReactNode } from 'react'

import type { FieldSize } from '../../components/ui/field.client'
import { FieldLabelContent } from '../../components/ui/field-label-content'
import { shouldShowVisibleRequiredMarker } from '../../components/ui/field-required.lib'
import {
  fieldLabelVariants,
  type FieldRhythm,
  type GroupHeadingScale,
} from '../../components/ui/field.variants'
import { cn } from '../../lib/utils'
import type { FieldHintConfig } from '../field-config'
import { normalizeFieldHint } from '../field-config'
import { resolveFormDensity, type FormDensity } from '../form-density'
import { resolveFormHeaderStackTypography } from './form-header-stack-typography.lib'
import {
  formSectionHeaderActionSlotClasses,
  formSectionHeaderLabelRowClasses,
  resolveFormSectionHeaderActionLayoutClasses,
} from './form-section-header.variants'

export interface FormSectionHeaderProps {
  label: string
  hint?: string | FieldHintConfig
  headingScale: GroupHeadingScale
  density?: FormDensity
  rhythm?: FieldRhythm
  size?: FieldSize
  action?: ReactNode
  /** Required markers, issue links, and similar accessories on the label line. */
  labelAccessory?: ReactNode
  required?: boolean
  /** When false, omit the visible label line. Hint and accessories remain. */
  showVisibleLabel?: boolean
  className?: string
  id?: string
}

function resolveHeaderDensity(
  options: Pick<FormSectionHeaderProps, 'density' | 'rhythm' | 'size'>,
): { rhythm: FieldRhythm; size: FieldSize } {
  if (options.rhythm !== undefined || options.size !== undefined) {
    return {
      rhythm: options.rhythm ?? 'comfortable',
      size: options.size ?? 'md',
    }
  }
  return resolveFormDensity(options.density)
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
}: FormSectionHeaderProps & { rhythm: FieldRhythm; size: FieldSize }): ReactNode {
  const stackTypography = resolveFormHeaderStackTypography({
    headingScale,
    rhythm,
    size,
  })
  const hintNode = renderFormSectionHint(hint, stackTypography.hintClass)

  let labelLine: ReactNode = null

  if (headingScale === 'field') {
    if (showVisibleLabel) {
      labelLine = (
        <div className={formSectionHeaderLabelRowClasses}>
          <span className={fieldLabelVariants({ size })}>
            <FieldLabelContent
              label={label}
              required={required}
              showRequiredMarker={shouldShowVisibleRequiredMarker(required ?? false, 'visible')}
            />
          </span>
          {labelAccessory}
        </div>
      )
    } else {
      const srOnlyLabel = (
        <span className={cn(fieldLabelVariants({ size }), 'sr-only')}>
          <FieldLabelContent
            label={label}
            required={required}
            showRequiredMarker={shouldShowVisibleRequiredMarker(required ?? false, 'visible')}
          />
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
  className,
  id,
}: FormSectionHeaderProps) {
  const { rhythm, size } = resolveHeaderDensity({
    density,
    rhythm: rhythmOverride,
    size: sizeOverride,
  })

  const headingBlock = renderHeadingBlock({
    label,
    hint,
    headingScale,
    labelAccessory,
    required,
    id,
    showVisibleLabel,
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
