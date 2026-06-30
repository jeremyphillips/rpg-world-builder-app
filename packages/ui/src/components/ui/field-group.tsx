import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  DEFAULT_FORM_RHYTHM,
  fieldGroupBottomMarginClasses,
  fieldGroupDescriptionClasses,
  fieldGroupLegendVariants,
  fieldStackRhythmVariants,
  fieldSetResetClasses,
  type FieldGroupLegendSize,
  type FieldStackRhythm,
} from './field.variants'
import { Text } from './text'

export type { FieldGroupLegendSize }

export interface FieldGroupProps {
  /** Group heading rendered as the fieldset legend. */
  legend: string
  /** Legend type scale — use `subsection` for nested groups, `array` for repeatable lists. */
  legendSize?: FieldGroupLegendSize
  /** Vertical gap between sibling fields — defaults to `comfortable` (`gap-6`). */
  rhythm?: FieldStackRhythm
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
  rhythm = DEFAULT_FORM_RHYTHM,
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
      <div className={fieldStackRhythmVariants({ rhythm })}>{children}</div>
    </fieldset>
  )
}
