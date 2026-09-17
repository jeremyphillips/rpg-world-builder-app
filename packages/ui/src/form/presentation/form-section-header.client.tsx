'use client'

import type { ReactNode } from 'react'

import { FieldLabelContent } from '../../components/ui/field-label-content'
import { shouldShowVisibleRequiredMarker } from '../../components/ui/field-required.lib'
import type { FieldSize } from '../../components/ui/field.client'
import {
  fieldGroupDescriptionTypographyClasses,
  fieldGroupLegendTypographyClasses,
  fieldLabelHintStackClasses,
  fieldLabelVariants,
  fieldSubgroupLegendTypographyClasses,
} from '../../components/ui/field.variants'
import { Text } from '../../components/ui/text'
import { cn } from '../../lib/utils'
import type { FieldHintConfig } from '../field-config'
import { normalizeFieldHint } from '../field-config'
import type { FormHeadingTier } from '../form-heading.lib'
import {
  formSectionHeaderActionLayoutClasses,
  formSectionHeaderActionSlotClasses,
  formSectionHeaderHeadingStackClasses,
  formSectionHeaderLabelRowClasses,
} from './form-section-header.variants'

export type FormSectionHeaderLabelPresentation = 'heading' | 'field-label'

export interface FormSectionHeaderProps {
  label: string
  hint?: string | FieldHintConfig
  /** Typography tier when `labelPresentation` is `heading`. */
  tier?: FormHeadingTier
  /** Leaf control scale when `tier` is `leaf`. */
  size?: FieldSize
  /**
   * `field-label` — array legends where outer `<legend>` owns label typography.
   * `heading` — standalone section headers.
   */
  labelPresentation?: FormSectionHeaderLabelPresentation
  action?: ReactNode
  /** Required markers, issue links, and similar accessories on the label line. */
  labelAccessory?: ReactNode
  required?: boolean
  className?: string
  id?: string
}

function renderFieldLabelHint(hint: string | FieldHintConfig | undefined): ReactNode {
  if (!hint) return null
  const normalized = normalizeFieldHint(hint)
  if (!normalized.text) return null
  return <Text variant="caption">{normalized.text}</Text>
}

function renderSectionHint(
  hint: string | FieldHintConfig | undefined,
  tier: FormHeadingTier,
): ReactNode {
  if (!hint) return null
  const normalized = normalizeFieldHint(hint)
  if (!normalized.text) return null
  if (tier === 'leaf') {
    return <Text variant="caption">{normalized.text}</Text>
  }
  return (
    <Text as="span" variant="small" className={fieldGroupDescriptionTypographyClasses}>
      {normalized.text}
    </Text>
  )
}

function renderHeadingLabelLine({
  label,
  tier,
  size,
  labelAccessory,
}: Pick<FormSectionHeaderProps, 'label' | 'tier' | 'size' | 'labelAccessory'> & {
  tier: FormHeadingTier
}): ReactNode {
  const labelNode =
    tier === 'leaf' ? (
      <div className={fieldLabelVariants({ size: size ?? 'md' })}>
        <FieldLabelContent label={label} />
      </div>
    ) : (
      <span
        className={
          tier === 'section'
            ? fieldGroupLegendTypographyClasses
            : fieldSubgroupLegendTypographyClasses
        }
      >
        {label}
      </span>
    )

  if (!labelAccessory) {
    return labelNode
  }

  return (
    <div className={formSectionHeaderLabelRowClasses}>
      {labelNode}
      {labelAccessory}
    </div>
  )
}

function renderHeadingBlock({
  label,
  hint,
  tier,
  size,
  labelPresentation,
  labelAccessory,
  required,
  id,
}: Pick<
  FormSectionHeaderProps,
  'label' | 'hint' | 'tier' | 'size' | 'labelPresentation' | 'labelAccessory' | 'required' | 'id'
>): ReactNode {
  if (labelPresentation === 'field-label') {
    const hintNode = renderFieldLabelHint(hint)
    const labelLine = (
      <div className={formSectionHeaderLabelRowClasses}>
        <span className={fieldLabelVariants({ size: size ?? 'md' })}>
          <FieldLabelContent
            label={label}
            required={required}
            showRequiredMarker={shouldShowVisibleRequiredMarker(required ?? false, 'visible')}
          />
        </span>
        {labelAccessory}
      </div>
    )

    if (hintNode) {
      return (
        <div id={id} className={fieldLabelHintStackClasses}>
          {labelLine}
          {hintNode}
        </div>
      )
    }

    return (
      <div id={id} className={formSectionHeaderLabelRowClasses}>
        <span className={fieldLabelVariants({ size: size ?? 'md' })}>
          <FieldLabelContent
            label={label}
            required={required}
            showRequiredMarker={shouldShowVisibleRequiredMarker(required ?? false, 'visible')}
          />
        </span>
        {labelAccessory}
      </div>
    )
  }

  const resolvedTier = tier ?? 'subsection'
  const labelLine = renderHeadingLabelLine({ label, tier: resolvedTier, size, labelAccessory })
  const hintNode = renderSectionHint(hint, resolvedTier)

  if (hintNode) {
    return (
      <div id={id} className={cn(formSectionHeaderHeadingStackClasses, 'min-w-0')}>
        {labelLine}
        {hintNode}
      </div>
    )
  }

  return (
    <div id={id} className="min-w-0">
      {labelLine}
    </div>
  )
}

/** Form section heading — label + optional hint with an optional trailing action. */
export function FormSectionHeader({
  label,
  hint,
  tier = 'subsection',
  size = 'md',
  labelPresentation = 'heading',
  action,
  labelAccessory,
  required,
  className,
  id,
}: FormSectionHeaderProps) {
  const headingBlock = renderHeadingBlock({
    label,
    hint,
    tier,
    size,
    labelPresentation,
    labelAccessory,
    required,
    id,
  })

  if (!action) {
    return <div className={className}>{headingBlock}</div>
  }

  return (
    <div className={cn(formSectionHeaderActionLayoutClasses, className)}>
      {headingBlock}
      <div className={formSectionHeaderActionSlotClasses}>{action}</div>
    </div>
  )
}
