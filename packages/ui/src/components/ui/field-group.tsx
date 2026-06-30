import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  fieldGroupBottomMarginClasses,
  fieldGroupDescriptionClasses,
  fieldGroupLegendVariants,
  fieldGroupStackClasses,
  fieldSetResetClasses,
  type FieldGroupLegendSize,
} from './field.variants'
import { Text } from './text'

export type { FieldGroupLegendSize }

export interface FieldGroupProps {
  /** Group heading rendered as the fieldset legend. */
  legend: string
  /** Legend type scale — use `subsection` for nested groups, `array` for repeatable lists. */
  legendSize?: FieldGroupLegendSize
  description?: string
  className?: string
  children: ReactNode
}

/**
 * Semantic grouping for related fields: a `<fieldset>` with a `<legend>`, which
 * screen readers announce as the group name for the controls inside.
 */
export function FieldGroup({
  legend,
  legendSize = 'section',
  description,
  className,
  children,
}: FieldGroupProps) {
  return (
    <fieldset className={cn(fieldSetResetClasses, fieldGroupBottomMarginClasses, className)}>
      <legend className={fieldGroupLegendVariants({ size: legendSize })}>{legend}</legend>
      {description ? (
        <Text variant="small" className={fieldGroupDescriptionClasses}>
          {description}
        </Text>
      ) : null}
      <div className={fieldGroupStackClasses}>{children}</div>
    </fieldset>
  )
}
