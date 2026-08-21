import { ChevronRight } from 'lucide-react'
import { Text } from '@rpg/ui'

import type {
  EntityAnatomyTrailing,
  EntityAnatomyTrailingSecondary,
} from './entity-anatomy-trailing.types'
import {
  entityAnatomyTrailingActionVariants,
  entityAnatomyTrailingGroupPrimaryVariants,
  entityAnatomyTrailingGroupSecondaryVariants,
  entityAnatomyTrailingGroupVariants,
  entityAnatomyTrailingIndicatorVariants,
} from './entity-anatomy-trailing.variants'

type EntityAnatomyTrailingSlotProps = {
  trailing?: EntityAnatomyTrailing
}

function EntityAnatomyTrailingQuantityLabel({
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

function EntityAnatomyTrailingSecondaryView({
  secondary,
}: {
  secondary: EntityAnatomyTrailingSecondary
}) {
  switch (secondary.kind) {
    case 'price':
    case 'grantPreview':
      return secondary.label
    case 'quantity':
      return <EntityAnatomyTrailingQuantityLabel quantity={secondary.quantity} format="label" />
    default: {
      const _exhaustive: never = secondary
      return _exhaustive
    }
  }
}

function EntityAnatomyTrailingGroup({
  trailing,
}: {
  trailing: Extract<EntityAnatomyTrailing, { kind: 'group' }>
}) {
  return (
    <div className={entityAnatomyTrailingGroupVariants()}>
      <div className={entityAnatomyTrailingGroupPrimaryVariants()}>{trailing.primary}</div>
      {trailing.secondary ? (
        <div className={entityAnatomyTrailingGroupSecondaryVariants()}>
          <EntityAnatomyTrailingSecondaryView secondary={trailing.secondary} />
        </div>
      ) : null}
    </div>
  )
}

/** Internal trailing rail renderer — not exported to feature consumers. */
export function EntityAnatomyTrailingSlot({ trailing }: EntityAnatomyTrailingSlotProps) {
  if (!trailing) {
    return null
  }

  switch (trailing.kind) {
    case 'action':
      return <div className={entityAnatomyTrailingActionVariants()}>{trailing.content}</div>
    case 'indicator':
      return (
        <div className={entityAnatomyTrailingIndicatorVariants()}>
          {trailing.variant === 'chevron' ? (
            <ChevronRight aria-hidden className="size-4 shrink-0" />
          ) : (
            <EntityAnatomyTrailingQuantityLabel
              quantity={trailing.quantity}
              format={trailing.format}
            />
          )}
        </div>
      )
    case 'group':
      return <EntityAnatomyTrailingGroup trailing={trailing} />
    default: {
      const _exhaustive: never = trailing
      return _exhaustive
    }
  }
}
