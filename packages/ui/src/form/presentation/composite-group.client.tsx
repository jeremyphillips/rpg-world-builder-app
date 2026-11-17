'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from '../../components/ui/field.client'
import { FieldHintBelowLabel } from '../../components/ui/field.client'
import {
  fieldAnatomyStackVariants,
  fieldLabelHintStackClasses,
  fieldSetInFlowLegendClasses,
} from '../../components/ui/field.variants'
import { normalizeFieldHint } from '../field-config'
import type { FormHeading } from '../form-heading.lib'
import { FormSectionHeader } from './form-section-header.client'

export interface CompositeGroupProps {
  heading: FormHeading
  children: React.ReactNode
  className?: string
  id?: string
  size?: FieldSize
  /** When true, wraps content in `<fieldset>` with leaf-tier `<legend>`. */
  useFieldset?: boolean
}

/**
 * Leaf-tier labeled composite block. Uses native fieldset semantics when
 * `useFieldset` is true; otherwise `role="group"` + `aria-labelledby`.
 */
export function CompositeGroup({
  heading,
  children,
  className,
  id,
  size = 'md',
  useFieldset = true,
}: CompositeGroupProps) {
  const headingId = React.useId()
  const hintId = React.useId()
  const hintText = normalizeFieldHint(heading.hint).text
  const titleOnlyHidden = heading.labelVisibility === 'srOnly' && !hintText && !heading.action
  const showVisibleLabel = heading.labelVisibility !== 'srOnly'

  const header = (
    <FormSectionHeader
      label={heading.label}
      headingScale="field"
      size={size}
      showVisibleLabel={showVisibleLabel}
      id={headingId}
      action={heading.action}
    />
  )

  const hintNode =
    hintText != null && hintText !== '' ? (
      <FieldHintBelowLabel hint={hintText} hintId={hintId} />
    ) : null

  const describedBy = hintText ? hintId : undefined

  const stackClassName = cn(
    'min-w-0',
    titleOnlyHidden ? 'flex flex-col' : fieldAnatomyStackVariants({ size }),
    className,
  )

  if (useFieldset) {
    return (
      <fieldset
        id={id}
        className={cn('border-0 p-0', stackClassName)}
        aria-describedby={describedBy}
      >
        <legend className={fieldSetInFlowLegendClasses}>{header}</legend>
        {hintNode}
        {children}
      </fieldset>
    )
  }

  return (
    <div
      id={id}
      role="group"
      aria-labelledby={headingId}
      aria-describedby={describedBy}
      className={stackClassName}
    >
      <div className={cn(hintText ? fieldLabelHintStackClasses : undefined, 'min-w-0')}>
        {header}
        {hintNode}
      </div>
      {children}
    </div>
  )
}
