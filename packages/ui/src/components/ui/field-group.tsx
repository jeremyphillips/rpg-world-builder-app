import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  fieldGroupDescriptionClasses,
  fieldGroupLegendVariants,
  fieldGroupStackClasses,
} from './field.variants'
import { Text } from './text'

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
      <legend className={fieldGroupLegendVariants()}>{legend}</legend>
      {description ? (
        <Text variant="small" className={fieldGroupDescriptionClasses}>
          {description}
        </Text>
      ) : null}
      <div className={fieldGroupStackClasses}>{children}</div>
    </fieldset>
  )
}
