'use client'

import { cn } from '../../lib/utils'
import { FieldHintBelowLabel, type FieldSize } from './field.client'
import type { FieldRhythm, FormHeadingScale } from './field.variants'
import { resolveFormHeaderStackTypography } from '../../form/presentation/form-header-stack-typography.lib'

export function FieldGroupLegendHint({
  hint,
  hintId,
  headingScale,
  rhythm,
  size,
  className,
}: {
  hint: string
  hintId: string
  headingScale: FormHeadingScale
  rhythm: FieldRhythm
  size: FieldSize
  className?: string
}) {
  if (headingScale === 'field') {
    return <FieldHintBelowLabel hint={hint} hintId={hintId} size={size} className={className} />
  }

  const stackTypography = resolveFormHeaderStackTypography({
    headingScale,
    rhythm,
    size,
  })

  return (
    <span id={hintId} className={cn(stackTypography.hintClass, className)}>
      {hint}
    </span>
  )
}
