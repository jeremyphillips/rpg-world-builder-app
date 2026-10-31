'use client'

import type { ReactNode } from 'react'

import { FieldLabelContent } from '../../components/ui/field-label-content'
import type { FieldSize } from '../../components/ui/field.client'
import { fieldLabelVariants } from '../../components/ui/field.variants'
import { Text } from '../../components/ui/text'
import { cn } from '../../lib/utils'
import type { FieldHintConfig } from '../field-config'
import { normalizeFieldHint } from '../field-config'
import type { FormHeadingTier } from '../form-heading.lib'
import {
  LeafFieldLabelHintCluster,
  renderLeafFieldHint,
} from './leaf-field-label-hint-cluster.client'
import {
  formSectionHeaderActionSlotClasses,
  formSectionHeaderHeadingStackClasses,
  formSectionHeaderLabelRowClasses,
  resolveFormSectionHeaderActionLayoutClasses,
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
   * `field-label` — leaf field label scale on the label line; outer legend uses in-flow classes.
   * `heading` — standalone section headers.
   */
  labelPresentation?: FormSectionHeaderLabelPresentation
  action?: ReactNode
  /** Required markers, issue links, and similar accessories on the label line. */
  labelAccessory?: ReactNode
  required?: boolean
  /** When false, omit the visible label line (field-label presentation only). Hint and accessories remain. */
  showVisibleLabel?: boolean
  className?: string
  id?: string
}

function renderSectionHint(
  hint: string | FieldHintConfig | undefined,
  tier: FormHeadingTier,
): ReactNode {
  if (!hint) return null
  const normalized = normalizeFieldHint(hint)
  if (!normalized.text) return null
  if (tier === 'leaf') {
    return renderLeafFieldHint(hint)
  }
  return (
    <Text as="span" variant="supporting">
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
        className={tier === 'section' ? 'text-style-field-legend' : 'text-style-field-legend-sub'}
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
  showVisibleLabel = true,
}: Pick<
  FormSectionHeaderProps,
  | 'label'
  | 'hint'
  | 'tier'
  | 'size'
  | 'labelPresentation'
  | 'labelAccessory'
  | 'required'
  | 'id'
  | 'showVisibleLabel'
>): ReactNode {
  if (labelPresentation === 'field-label') {
    return (
      <LeafFieldLabelHintCluster
        label={label}
        hint={hint}
        size={size ?? 'md'}
        required={required}
        labelAccessory={labelAccessory}
        showVisibleLabel={showVisibleLabel}
        id={id}
      />
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

function hasFormSectionHeaderStackedHint(hint: string | FieldHintConfig | undefined): boolean {
  if (!hint) return false
  const normalized = normalizeFieldHint(hint)
  return Boolean(normalized.text)
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
  showVisibleLabel,
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
    showVisibleLabel,
  })

  if (!action) {
    return <div className={className}>{headingBlock}</div>
  }

  const hasStackedHint = hasFormSectionHeaderStackedHint(hint)

  return (
    <div className={cn(resolveFormSectionHeaderActionLayoutClasses({ hasStackedHint }), className)}>
      {headingBlock}
      <div className={formSectionHeaderActionSlotClasses}>{action}</div>
    </div>
  )
}
