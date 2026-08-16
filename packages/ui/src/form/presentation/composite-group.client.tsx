'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from '../../components/ui/field.client'
import type { FormHeading } from '../form-heading.lib'
import { HeadingPresentation } from './heading-presentation.client'

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
  const presentation = (
    <HeadingPresentation
      tier="leaf"
      label={heading.label}
      hint={heading.hint}
      id={headingId}
      as={useFieldset ? 'legend' : 'span'}
      size={size}
    />
  )

  if (useFieldset) {
    return (
      <fieldset id={id} className={cn('min-w-0 border-0 p-0', className)}>
        {presentation}
        {children}
      </fieldset>
    )
  }

  return (
    <div id={id} role="group" aria-labelledby={headingId} className={cn('min-w-0', className)}>
      {presentation}
      {children}
    </div>
  )
}
