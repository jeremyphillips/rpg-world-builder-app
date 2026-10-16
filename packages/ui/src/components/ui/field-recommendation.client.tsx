'use client'

import { Button } from './button.client'
import { Text } from './text'
import { fieldRecommendationActionVariants, fieldRecommendationRowClasses } from './field.variants'
import type { FieldRecommendation } from './field-recommendation.types'
import { resolveFieldRecommendationButtonScale } from './field-recommendation.lib'
import { useFormSectionContext } from '../../form/context/form-section.context'
import { cn } from '../../lib/utils'

export type { FieldRecommendation } from './field-recommendation.types'

export interface FieldRecommendationInlineProps {
  recommendation: FieldRecommendation
  className?: string
}

/** Pre-control recommendation copy with a trailing text action. */
export function FieldRecommendationInline({
  recommendation,
  className,
}: FieldRecommendationInlineProps) {
  const { density } = useFormSectionContext()
  const buttonScale = resolveFieldRecommendationButtonScale(density)

  return (
    <div className={cn(fieldRecommendationRowClasses, className)} data-field-recommendation="">
      <Text variant="caption" as="span">
        {recommendation.content}
      </Text>
      <Button
        type="button"
        variant="text"
        tone="accent"
        size={buttonScale.size}
        density={buttonScale.density}
        aria-label={recommendation.action.ariaLabel}
        className={fieldRecommendationActionVariants()}
        onClick={recommendation.action.onClick}
      >
        {recommendation.action.label}
      </Button>
    </div>
  )
}
