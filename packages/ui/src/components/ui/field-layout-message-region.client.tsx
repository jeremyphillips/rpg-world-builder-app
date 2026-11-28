'use client'

import { Field } from './field.client'
import type { FieldHintPosition } from './field.variants'
import { FieldIntrinsicSpill } from './field-layout-intrinsic-spill.client'

export function FieldLayoutMessageRegionContent({
  hintPosition,
  autoRowIntrinsicSizing,
}: {
  hintPosition: FieldHintPosition
  autoRowIntrinsicSizing: boolean
}) {
  const belowControlHint = hintPosition === 'below-control' ? <Field.Hint /> : null

  if (!autoRowIntrinsicSizing) {
    return (
      <>
        <Field.DerivedMeta />
        {belowControlHint}
        <Field.Error />
      </>
    )
  }

  return (
    <>
      <FieldIntrinsicSpill>
        <Field.DerivedMeta />
      </FieldIntrinsicSpill>
      {belowControlHint ? <FieldIntrinsicSpill>{belowControlHint}</FieldIntrinsicSpill> : null}
      <FieldIntrinsicSpill>
        <Field.Error />
      </FieldIntrinsicSpill>
    </>
  )
}
