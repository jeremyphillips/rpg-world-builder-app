'use client'

import type { ReactNode } from 'react'

import { Button, Text } from '@rpg/ui'

import {
  builderInventoryRowActionsClasses,
  builderInventoryRowClasses,
  builderInventoryRowMetaClasses,
  builderInventoryRowSourceClasses,
} from './builder-inventory-row.variants'

export const BUILDER_INVENTORY_ROW_REMOVE_LABEL = 'Remove' as const

export type BuilderInventoryRowProps = {
  label: ReactNode
  meta?: ReactNode
  sourceLabel: string
  onRemove?: () => void
  removeLabel?: string
}

export function BuilderInventoryRow({
  label,
  meta,
  sourceLabel,
  onRemove,
  removeLabel = BUILDER_INVENTORY_ROW_REMOVE_LABEL,
}: BuilderInventoryRowProps) {
  return (
    <div className={builderInventoryRowClasses}>
      <div className={builderInventoryRowMetaClasses}>
        {label}
        {meta}
      </div>
      <div className={builderInventoryRowActionsClasses}>
        <Text variant="small" className={builderInventoryRowSourceClasses}>
          {sourceLabel}
        </Text>
        {onRemove ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            {removeLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
