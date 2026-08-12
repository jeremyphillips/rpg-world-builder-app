'use client'

import { ChevronRight } from 'lucide-react'
import { Text } from '@rpg/ui'

import type { EntityItemTrailing, EntityItemTrailingSecondary } from './entity-item-trailing.types'
import {
  entityItemTrailingActionVariants,
  entityItemTrailingGroupPrimaryVariants,
  entityItemTrailingGroupSecondaryVariants,
  entityItemTrailingGroupVariants,
  entityItemTrailingIndicatorVariants,
} from './entity-item-trailing.variants'

type EntityItemTrailingSlotProps = {
  trailing?: EntityItemTrailing
}

function EntityItemTrailingQuantityLabel({
  quantity,
  format = 'compact',
}: {
  quantity: number
  format?: 'compact' | 'label'
}) {
  if (quantity <= 1) return null

  return (
    <Text as="span" variant="muted">
      {format === 'label' ? `Qty ${quantity}` : `×${quantity}`}
    </Text>
  )
}

function EntityItemTrailingSecondaryView({
  secondary,
}: {
  secondary: EntityItemTrailingSecondary
}) {
  switch (secondary.kind) {
    case 'price':
    case 'grantPreview':
      return secondary.label
    case 'quantity':
      return <EntityItemTrailingQuantityLabel quantity={secondary.quantity} format="label" />
    default: {
      const _exhaustive: never = secondary
      return _exhaustive
    }
  }
}

function EntityItemTrailingGroup({
  trailing,
}: {
  trailing: Extract<EntityItemTrailing, { kind: 'group' }>
}) {
  return (
    <div className={entityItemTrailingGroupVariants()}>
      <div className={entityItemTrailingGroupPrimaryVariants()}>{trailing.primary}</div>
      {trailing.secondary ? (
        <div className={entityItemTrailingGroupSecondaryVariants()}>
          <EntityItemTrailingSecondaryView secondary={trailing.secondary} />
        </div>
      ) : null}
    </div>
  )
}

/** Internal trailing rail renderer — not exported to feature consumers. */
export function EntityItemTrailingSlot({ trailing }: EntityItemTrailingSlotProps) {
  if (!trailing) {
    return null
  }

  switch (trailing.kind) {
    case 'action':
      return <div className={entityItemTrailingActionVariants()}>{trailing.content}</div>
    case 'indicator':
      return (
        <div className={entityItemTrailingIndicatorVariants()}>
          {trailing.variant === 'chevron' ? (
            <ChevronRight aria-hidden className="size-4 shrink-0" />
          ) : (
            <EntityItemTrailingQuantityLabel
              quantity={trailing.quantity}
              format={trailing.format}
            />
          )}
        </div>
      )
    case 'group':
      return <EntityItemTrailingGroup trailing={trailing} />
    default: {
      const _exhaustive: never = trailing
      return _exhaustive
    }
  }
}
