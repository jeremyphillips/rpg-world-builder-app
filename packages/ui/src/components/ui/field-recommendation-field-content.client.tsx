'use client'

import { cn } from '../../lib/utils'
import {
  FieldRecommendationGroupView,
  FieldRecommendationInline,
} from './field-recommendation.client'
import type { FieldLayoutRecommendation } from './field-recommendation.types'
import { isFieldRecommendationGroup } from './field-recommendation.types'
import { fieldRecommendationRowClasses } from './field.variants'

export function FieldRecommendationFieldContent({
  recommendation,
  className,
}: {
  recommendation: FieldLayoutRecommendation
  className?: string
}) {
  if (isFieldRecommendationGroup(recommendation)) {
    return (
      <div className={cn(fieldRecommendationRowClasses, className)}>
        <FieldRecommendationGroupView group={recommendation} placement="field" />
      </div>
    )
  }

  return <FieldRecommendationInline recommendation={recommendation} className={className} />
}
