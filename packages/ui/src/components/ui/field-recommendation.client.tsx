'use client'

import { Button } from './button.client'
import {
  fieldRecommendationActionVariants,
  fieldRecommendationGroupClasses,
  fieldRecommendationGroupItemLabelClasses,
  fieldRecommendationGroupItemsClasses,
  fieldRecommendationGroupPairClasses,
  fieldRecommendationRowClasses,
  fieldRecommendationSupportingTextClasses,
} from './field.variants'
import type {
  FieldRecommendation,
  FieldRecommendationAction,
  FieldRecommendationGroup,
} from './field-recommendation.types'
import { resolveFieldRecommendationButtonScale } from './field-recommendation.lib'
import { InlineMetadata } from './inline-metadata'
import { useFormSectionContext } from '../../form/context/form-section.context'
import { cn } from '../../lib/utils'

export type {
  FieldRecommendation,
  FieldRecommendationAction,
  FieldRecommendationGroup,
  FieldRecommendationItem,
} from './field-recommendation.types'

function FieldRecommendationActionButton({ action }: { action: FieldRecommendationAction }) {
  const { density } = useFormSectionContext()
  const buttonScale = resolveFieldRecommendationButtonScale(density)

  return (
    <Button
      type="button"
      variant="text"
      tone="accent"
      size={buttonScale.size}
      density={buttonScale.density}
      aria-label={action.ariaLabel}
      className={cn(fieldRecommendationActionVariants(), 'shrink-0')}
      onClick={action.onClick}
    >
      {action.label}
    </Button>
  )
}

export interface FieldRecommendationInlineProps {
  recommendation: FieldRecommendation
  className?: string
}

/** Pre-control recommendation copy with a trailing text action. */
export function FieldRecommendationInline({
  recommendation,
  className,
}: FieldRecommendationInlineProps) {
  return (
    <div className={cn(fieldRecommendationRowClasses, className)} data-field-recommendation="">
      <span className={fieldRecommendationSupportingTextClasses}>{recommendation.content}</span>
      <FieldRecommendationActionButton action={recommendation.action} />
    </div>
  )
}

export interface FieldRecommendationGroupProps {
  group: FieldRecommendationGroup
  className?: string
}

/** Compact inline recommendations above a collection list or empty state. */
export function FieldRecommendationGroupView({ group, className }: FieldRecommendationGroupProps) {
  const { density } = useFormSectionContext()

  if (group.items.length === 0) return null

  return (
    <div
      className={cn(fieldRecommendationGroupClasses, className)}
      data-field-recommendation-group=""
    >
      {group.sourceLabel ? (
        <span className={fieldRecommendationSupportingTextClasses}>{group.sourceLabel}</span>
      ) : null}
      <InlineMetadata
        role="heading"
        density={density}
        wrap
        className={fieldRecommendationGroupItemsClasses}
      >
        {group.items.map((item) => (
          <InlineMetadata.Item key={item.id}>
            <span className={fieldRecommendationGroupPairClasses} data-field-recommendation-item="">
              <span className={fieldRecommendationGroupItemLabelClasses}>{item.label}</span>
              <FieldRecommendationActionButton action={item.action} />
            </span>
          </InlineMetadata.Item>
        ))}
      </InlineMetadata>
    </div>
  )
}
