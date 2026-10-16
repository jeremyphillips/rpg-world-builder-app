'use client'

import type { ReactNode } from 'react'

import { Field } from './field.client'
import { fieldLabelHintStackClasses, type FieldHintPosition } from './field.variants'
import { FieldRecommendationInline } from './field-recommendation.client'
import type { FieldRecommendation } from './field-recommendation.types'

export function buildLabelHintStackContent(options: {
  hintPosition: FieldHintPosition
  showVisibleLabel: boolean
  label: ReactNode
}): ReactNode {
  const { hintPosition, showVisibleLabel, label } = options
  if (hintPosition === 'below-label') {
    if (showVisibleLabel) {
      return (
        <div className={fieldLabelHintStackClasses}>
          {label}
          <Field.Hint />
        </div>
      )
    }
    return <Field.Hint />
  }
  return showVisibleLabel ? label : null
}

export function FieldLayoutLabelRegionContent({
  hintPosition,
  showVisibleLabel,
  label,
  recommendation,
}: {
  hintPosition: FieldHintPosition
  showVisibleLabel: boolean
  label: ReactNode
  recommendation: FieldRecommendation | null
}) {
  const labelHintStack = buildLabelHintStackContent({ hintPosition, showVisibleLabel, label })
  if (!labelHintStack && !recommendation) return null

  return (
    <>
      {labelHintStack}
      {recommendation ? <FieldRecommendationInline recommendation={recommendation} /> : null}
    </>
  )
}
