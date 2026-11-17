'use client'

import { FieldHintBelowLabel, type FieldSize } from './field.client'
import type { FieldRhythm, FormHeadingScale } from './field.variants'
import { resolveFormHeaderStackTypography } from '../../form/presentation/form-header-stack-typography.lib'

export function FieldGroupLegendHint({
  hint,
  hintId,
  headingScale,
  rhythm,
  size,
}: {
  hint: string
  hintId: string
  headingScale: FormHeadingScale
  rhythm: FieldRhythm
  size: FieldSize
}) {
  if (headingScale === 'field') {
    return <FieldHintBelowLabel hint={hint} hintId={hintId} size={size} />
  }

  const stackTypography = resolveFormHeaderStackTypography({
    headingScale,
    rhythm,
    size,
  })

  return (
    <span id={hintId} className={stackTypography.hintClass}>
      {hint}
    </span>
  )
}
