import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'

export interface FieldGroupProps {
  /** Group heading rendered as the fieldset legend. */
  legend: string
  description?: string
  className?: string
  children: ReactNode
}

/**
 * Semantic grouping for related fields: a `<fieldset>` with a `<legend>`, which
 * screen readers announce as the group name for the controls inside.
 */
export function FieldGroup({ legend, description, className, children }: FieldGroupProps) {
  return (
    <fieldset className={cn('min-w-0 border-0 p-0', className)}>
      <legend className="mb-1 text-sm font-semibold leading-none">{legend}</legend>
      {description ? <p className="mb-3 text-sm text-muted-foreground">{description}</p> : null}
      <div className="space-y-4">{children}</div>
    </fieldset>
  )
}
