'use client'

import type { ReactNode } from 'react'

import type { FieldSizeToken } from '../../components/ui/field-sizing.variants'
import {
  fieldSetInFlowLegendClasses,
  resolveArrayLegendSpacingClassName,
} from '../../components/ui/field.variants'
import { cn } from '../../lib/utils'
import type { FieldHintConfig } from '../field-config'
import { FormSectionHeader } from './form-section-header.client'

export type ArrayLikeSectionHeaderWrapper = 'legend' | 'none'

export interface ArrayLikeSectionHeaderProps {
  label: string
  hint?: string | FieldHintConfig
  size?: FieldSizeToken
  action?: ReactNode
  /** Required markers, issue links, and similar accessories on the label line. */
  labelAccessory?: ReactNode
  required?: boolean
  id?: string
  className?: string
  /** When false, omit the visible label line; hint and accessories remain. */
  showVisibleLabel?: boolean
  /**
   * `legend` — array fieldset legends and other `<fieldset>` section headers.
   * `none` — standalone sections that are not wrapped in a fieldset.
   */
  wrapper?: ArrayLikeSectionHeaderWrapper
}

function arraySectionHeaderSpacingClassName(
  size: FieldSizeToken,
  wrapper: ArrayLikeSectionHeaderWrapper,
): string | undefined {
  return wrapper === 'legend' ? resolveArrayLegendSpacingClassName(size) : undefined
}

/** Leaf-tier section header shared by array legends and custom slot sections. */
export function ArrayLikeSectionHeader({
  label,
  hint,
  size = 'md',
  action,
  labelAccessory,
  required,
  id,
  className,
  showVisibleLabel = true,
  wrapper = 'legend',
}: ArrayLikeSectionHeaderProps) {
  const header = (
    <FormSectionHeader
      label={label}
      hint={hint}
      labelPresentation="field-label"
      size={size}
      action={action}
      labelAccessory={labelAccessory}
      required={required}
      id={id}
      showVisibleLabel={showVisibleLabel}
    />
  )

  if (wrapper === 'none') {
    return <div className={className}>{header}</div>
  }

  return (
    <legend
      className={cn(
        fieldSetInFlowLegendClasses,
        arraySectionHeaderSpacingClassName(size, wrapper),
        'w-full min-w-0',
        className,
      )}
    >
      {header}
    </legend>
  )
}
