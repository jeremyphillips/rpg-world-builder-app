'use client'

import type { EntityItemTrailing } from './entity-item-trailing.types'
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

function EntityItemTrailingGroup({
  trailing,
}: {
  trailing: Extract<EntityItemTrailing, { kind: 'group' }>
}) {
  return (
    <div className={entityItemTrailingGroupVariants()}>
      <div className={entityItemTrailingGroupPrimaryVariants()}>{trailing.primary}</div>
      {trailing.secondary ? (
        <div className={entityItemTrailingGroupSecondaryVariants()}>{trailing.secondary}</div>
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
      return <div className={entityItemTrailingIndicatorVariants()}>{trailing.content}</div>
    case 'group':
      return <EntityItemTrailingGroup trailing={trailing} />
    default: {
      const _exhaustive: never = trailing
      return _exhaustive
    }
  }
}
