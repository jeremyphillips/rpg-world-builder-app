'use client'

import type { ReactNode } from 'react'

import { Field } from './field.client'
import { fieldLabelHintStackClasses, type FieldHintPosition } from './field.variants'
import { FieldRecommendationFieldContent } from './field-recommendation-field-content.client'
import type { FieldLayoutRecommendation } from './field-recommendation.types'
import { FieldIntrinsicSizing, FieldIntrinsicSpill } from './field-layout-intrinsic-spill.client'

export function buildLabelHintStackContent(options: {
  hintPosition: FieldHintPosition
  showVisibleLabel: boolean
  label: ReactNode
  autoRowIntrinsicSizing: boolean
}): ReactNode {
  const { hintPosition, showVisibleLabel, label, autoRowIntrinsicSizing } = options
  if (hintPosition === 'below-label') {
    if (autoRowIntrinsicSizing) {
      if (showVisibleLabel) {
        return (
          <div className={fieldLabelHintStackClasses}>
            <FieldIntrinsicSizing>{label}</FieldIntrinsicSizing>
            <FieldIntrinsicSpill>
              <Field.Hint />
            </FieldIntrinsicSpill>
          </div>
        )
      }
      return (
        <FieldIntrinsicSpill>
          <Field.Hint />
        </FieldIntrinsicSpill>
      )
    }
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
  if (autoRowIntrinsicSizing && showVisibleLabel) {
    return <FieldIntrinsicSizing>{label}</FieldIntrinsicSizing>
  }
  return showVisibleLabel ? label : null
}

export function FieldLayoutLabelRegionContent({
  hintPosition,
  showVisibleLabel,
  label,
  recommendation,
  autoRowIntrinsicSizing,
}: {
  hintPosition: FieldHintPosition
  showVisibleLabel: boolean
  label: ReactNode
  recommendation: FieldLayoutRecommendation | null
  autoRowIntrinsicSizing: boolean
}) {
  const labelHintStack = buildLabelHintStackContent({
    hintPosition,
    showVisibleLabel,
    label,
    autoRowIntrinsicSizing,
  })
  if (!labelHintStack && !recommendation) return null

  const recommendationNode = recommendation ? (
    <FieldRecommendationFieldContent recommendation={recommendation} />
  ) : null

  return (
    <>
      {labelHintStack}
      {recommendationNode ? (
        autoRowIntrinsicSizing ? (
          <FieldIntrinsicSpill>{recommendationNode}</FieldIntrinsicSpill>
        ) : (
          recommendationNode
        )
      ) : null}
    </>
  )
}
