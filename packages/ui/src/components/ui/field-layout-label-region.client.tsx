'use client'

import type { ReactNode } from 'react'

import { Field } from './field.client'
import { fieldLabelHintStackClasses, type FieldHintPosition } from './field.variants'
import { FieldRecommendationFieldContent } from './field-recommendation-field-content.client'
import type { FieldLayoutRecommendation } from './field-recommendation.types'

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
  recommendation: FieldLayoutRecommendation | null
}) {
  const labelHintStack = buildLabelHintStackContent({ hintPosition, showVisibleLabel, label })
  if (!labelHintStack && !recommendation) return null

  return (
    <>
      {labelHintStack}
      {recommendation ? <FieldRecommendationFieldContent recommendation={recommendation} /> : null}
    </>
  )
}
