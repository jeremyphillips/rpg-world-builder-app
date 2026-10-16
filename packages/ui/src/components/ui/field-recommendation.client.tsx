'use client'

import { Fragment } from 'react'
import { INLINE_METADATA_SEPARATOR } from '@rpg/contracts/primitives'

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
import { inlineMetadataSeparatorVariants } from './inline-metadata.variants'
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

function FieldRecommendationGroupSeparator() {
  const { density } = useFormSectionContext()
  const className = inlineMetadataSeparatorVariants({
    density,
    wrap: true,
  })

  return (
    <span aria-hidden="true" data-field-recommendation-separator="" className={className}>
      {'\u00A0'}
      {INLINE_METADATA_SEPARATOR}{' '}
    </span>
  )
}

/** Compact inline recommendations above a collection list or empty state. */
export function FieldRecommendationGroupView({ group, className }: FieldRecommendationGroupProps) {
  if (group.items.length === 0) return null

  return (
    <div
      className={cn(fieldRecommendationGroupClasses, className)}
      data-field-recommendation-group=""
    >
      {group.sourceLabel ? (
        <span className={fieldRecommendationSupportingTextClasses}>{group.sourceLabel}</span>
      ) : null}
      <div className={fieldRecommendationGroupItemsClasses}>
        {group.items.map((item, index) => (
          <Fragment key={item.id}>
            {index > 0 ? <FieldRecommendationGroupSeparator /> : null}
            <span className={fieldRecommendationGroupPairClasses} data-field-recommendation-item="">
              <span className={fieldRecommendationGroupItemLabelClasses}>{item.label}</span>
              <FieldRecommendationActionButton action={item.action} />
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
