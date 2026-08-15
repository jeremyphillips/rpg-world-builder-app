'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  fieldGroupDescriptionTypographyClasses,
  fieldGroupLegendHeaderStackClasses,
  fieldLabelVariants,
  resolveFieldGroupLegendClassName,
  type FieldGroupLegendScale,
} from '../../components/ui/field.variants'
import type { FieldSize } from '../../components/ui/field.client'
import { Text } from '../../components/ui/text'
import type { FieldHintConfig } from '../field-config'
import { normalizeFieldHint } from '../field-config'
import type { FormHeadingTier } from '../form-heading.lib'

export interface HeadingPresentationProps {
  tier: FormHeadingTier
  label: string
  hint?: string | FieldHintConfig
  id?: string
  /** Element type for the label line — caller chooses semantic wrapper context. */
  as?: 'span' | 'legend' | 'h3'
  className?: string
  /** Leaf-tier control scale; ignored for section/subsection. */
  size?: FieldSize
  /** Array-tier density scale bridge; internal use only. */
  arrayScale?: FieldGroupLegendScale
}

function resolveHeadingLabelClassName(
  tier: FormHeadingTier,
  size: FieldSize,
  arrayScale: FieldGroupLegendScale,
): string {
  if (tier === 'leaf') {
    return fieldLabelVariants({ size })
  }
  if (tier === 'section') {
    return resolveFieldGroupLegendClassName({ size: 'section' })
  }
  if (tier === 'subsection') {
    return resolveFieldGroupLegendClassName({ size: 'subsection' })
  }
  return resolveFieldGroupLegendClassName({ size: 'array', scale: arrayScale })
}

function renderHint(hint: string | FieldHintConfig | undefined, tier: FormHeadingTier): ReactNode {
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

/** Styled heading label + hint — typography only; no container semantics. */
export function HeadingPresentation({
  tier,
  label,
  hint,
  id,
  as: Component = 'span',
  className,
  size = 'md',
  arrayScale = 'default',
}: HeadingPresentationProps) {
  const labelClassName = resolveHeadingLabelClassName(tier, size, arrayScale)
  const hintNode = renderHint(hint, tier)

  if (hintNode) {
    return (
      <Component id={id} className={cn(fieldGroupLegendHeaderStackClasses, className)}>
        <span className={labelClassName}>{label}</span>
        {hintNode}
      </Component>
    )
  }

  return (
    <Component id={id} className={cn(labelClassName, className)}>
      {label}
    </Component>
  )
}
