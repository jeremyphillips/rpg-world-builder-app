'use client'

import { Button } from './button.client'
import {
  fieldRecommendationActionVariants,
  fieldRecommendationCollectionGroupClasses,
  fieldRecommendationFieldGroupClasses,
  fieldRecommendationGroupHeaderClasses,
  fieldRecommendationGroupItemsClasses,
  fieldRecommendationRowClasses,
  fieldRecommendationSupportingTextClasses,
} from './field.variants'
import type {
  FieldRecommendation,
  FieldRecommendationAction,
  FieldRecommendationGroup,
  FieldRecommendationItem,
} from './field-recommendation.types'
import {
  FIELD_RECOMMENDATION_GROUP_BULK_ADD_LABEL,
  resolveFieldRecommendationButtonScale,
  resolveFieldRecommendationGroupBulkAction,
} from './field-recommendation.lib'
import { useFormSectionContext } from '../../form/context/form-section.context'
import { cn } from '../../lib/utils'

export type {
  FieldLayoutRecommendation,
  FieldRecommendation,
  FieldRecommendationAction,
  FieldRecommendationGroup,
  FieldRecommendationItem,
} from './field-recommendation.types'
export { isFieldRecommendationGroup } from './field-recommendation.types'

function FieldRecommendationGroupItemButton({ item }: { item: FieldRecommendationItem }) {
  const { density } = useFormSectionContext()
  const buttonScale = resolveFieldRecommendationButtonScale(density)

  return (
    <Button
      type="button"
      variant="outline"
      size={buttonScale.size}
      aria-label={item.action.ariaLabel}
      className="max-w-full shrink-0"
      data-field-recommendation-item=""
      disabled={item.disabled}
      onClick={item.action.onClick}
    >
      + {item.label}
    </Button>
  )
}

function FieldRecommendationGroupBulkButton({ action }: { action: FieldRecommendationAction }) {
  const { density } = useFormSectionContext()
  const buttonScale = resolveFieldRecommendationButtonScale(density)

  return (
    <Button
      type="button"
      variant="ghost"
      size={buttonScale.size}
      aria-label={action.ariaLabel}
      className="shrink-0"
      data-field-recommendation-bulk=""
      onClick={action.onClick}
    >
      {FIELD_RECOMMENDATION_GROUP_BULK_ADD_LABEL}
    </Button>
  )
}

function FieldRecommendationActionButton({ action }: { action: FieldRecommendationAction }) {
  const { density } = useFormSectionContext()
  const buttonScale = resolveFieldRecommendationButtonScale(density)

  return (
    <Button
      type="button"
      variant="text"
      tone="accent"
      size={buttonScale.size}
      aria-label={action.ariaLabel}
      className={cn(fieldRecommendationActionVariants, 'shrink-0')}
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
  /** `field` — inside `FieldLayout` above the control. `collection` — above a list host. */
  placement?: 'field' | 'collection'
  className?: string
}

/** Compact inline recommendations above a collection list or empty state. */
export function FieldRecommendationGroupView({
  group,
  placement = 'collection',
  className,
}: FieldRecommendationGroupProps) {
  if (group.items.length === 0) return null

  const bulkAction = resolveFieldRecommendationGroupBulkAction(group)
  const showHeader = Boolean(group.sourceLabel) || Boolean(bulkAction)
  const shellClassName =
    placement === 'field'
      ? fieldRecommendationFieldGroupClasses
      : fieldRecommendationCollectionGroupClasses

  return (
    <div
      className={cn(shellClassName, className)}
      data-field-recommendation-group=""
      data-field-recommendation-placement={placement}
    >
      {showHeader ? (
        <div className={fieldRecommendationGroupHeaderClasses}>
          {group.sourceLabel ? (
            <span className={fieldRecommendationSupportingTextClasses}>{group.sourceLabel}</span>
          ) : null}
          {bulkAction ? <FieldRecommendationGroupBulkButton action={bulkAction} /> : null}
        </div>
      ) : null}
      <div className={fieldRecommendationGroupItemsClasses}>
        {group.items.map((item) => (
          <FieldRecommendationGroupItemButton key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
