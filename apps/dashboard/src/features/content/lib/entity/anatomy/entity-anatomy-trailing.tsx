import { ChevronRight } from 'lucide-react'
import { RowAnatomyCell, Text } from '@rpg/ui'

import type { EntityAnatomyColumn } from './entity-anatomy.types'
import { resolveEntityAnatomyTrailingCells } from './entity-anatomy-trailing.lib'
import type {
  EntityAnatomyTrailing,
  EntityAnatomyTrailingSecondary,
} from './entity-anatomy-trailing.types'
import {
  entityAnatomyTrailingActionVariants,
  entityAnatomyTrailingGroupSecondaryVariants,
  entityAnatomyTrailingIndicatorVariants,
  entityAnatomyTrailingMetaVariants,
  entityAnatomyTrailingQuantityLabelVariants,
} from './entity-anatomy-trailing.variants'

type EntityAnatomyTrailingCellsProps = {
  trailing?: EntityAnatomyTrailing
}

function quantityIndicatorText(
  quantity: number,
  format: 'compact' | 'label' | 'additional',
): string | null {
  if (format === 'additional') return quantity >= 1 ? `+${quantity}` : null
  if (quantity <= 1) return null
  return format === 'label' ? `Qty ${quantity}` : `×${quantity}`
}

function EntityAnatomyTrailingQuantityLabel({
  quantity,
  format = 'compact',
}: {
  quantity: number
  format?: 'compact' | 'label' | 'additional'
}) {
  const label = quantityIndicatorText(quantity, format)
  if (!label) return null

  return (
    <Text as="span" variant="muted" className={entityAnatomyTrailingQuantityLabelVariants()}>
      {label}
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

function EntityAnatomyTrailingMeta({ meta }: { meta?: string }) {
  if (!meta) return null

  return (
    <Text as="span" variant="muted" className={entityAnatomyTrailingMetaVariants()}>
      {meta}
    </Text>
  )
}

function EntityAnatomyTrailingPrimary({ trailing }: { trailing: EntityAnatomyTrailing }) {
  switch (trailing.kind) {
    case 'action':
    case 'utility':
      return (
        <div className={entityAnatomyTrailingActionVariants()}>
          <EntityAnatomyTrailingMeta meta={trailing.meta} />
          {trailing.content}
        </div>
      )
    case 'indicator':
      return (
        <div className={entityAnatomyTrailingIndicatorVariants()}>
          {trailing.variant === 'label' ? (
            <Text
              as="span"
              variant="muted"
              className={entityAnatomyTrailingQuantityLabelVariants()}
            >
              {trailing.label}
            </Text>
          ) : (
            <>
              <EntityAnatomyTrailingMeta meta={trailing.meta} />
              {trailing.variant === 'chevron' ? (
                <ChevronRight aria-hidden className="size-4 shrink-0" />
              ) : (
                <EntityAnatomyTrailingQuantityLabel
                  quantity={trailing.quantity}
                  format={trailing.format}
                />
              )}
            </>
          )}
        </div>
      )
    case 'group':
      return (
        <div className={entityAnatomyTrailingActionVariants()}>
          {trailing.secondary ? (
            <span
              className={entityAnatomyTrailingGroupSecondaryVariants()}
              data-entity-item-slot="trailing-secondary"
            >
              <EntityAnatomyTrailingSecondaryView secondary={trailing.secondary} />
            </span>
          ) : null}
          {trailing.primary}
        </div>
      )
    default: {
      const _exhaustive: never = trailing
      return _exhaustive
    }
  }
}

/** Internal trailing renderer — one RowAnatomy cell per trailing part; kind selects the cell. */
export function EntityAnatomyTrailingCells({ trailing }: EntityAnatomyTrailingCellsProps) {
  if (!trailing) {
    return null
  }

  const cells = resolveEntityAnatomyTrailingCells(trailing)

  return (
    <RowAnatomyCell<EntityAnatomyColumn>
      cell={cells.primary}
      data-entity-item-slot="trailing"
      data-entity-trailing-kind={trailing.kind}
    >
      <EntityAnatomyTrailingPrimary trailing={trailing} />
    </RowAnatomyCell>
  )
}
