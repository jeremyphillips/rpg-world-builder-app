'use client'

import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'

import { Text } from '@rpg/ui'

import {
  builderInventoryRowActionsClasses,
  builderInventoryRowClasses,
  builderInventoryRowMetaClasses,
  builderInventoryRowRemoveButtonClasses,
  builderInventoryRowSourceClasses,
} from './builder-inventory-row.variants'

export const BUILDER_INVENTORY_ROW_REMOVE_LABEL_PREFIX = 'Remove' as const

export function formatBuilderInventoryRowRemoveLabel(label: string): string {
  return `${BUILDER_INVENTORY_ROW_REMOVE_LABEL_PREFIX} ${label}`
}

export type BuilderInventoryRowProps = {
  label: ReactNode
  /** Plain-text label used for the icon-only remove button aria-label. */
  itemLabel: string
  meta?: ReactNode
  sourceLabel?: string
  onRemove?: () => void
}

export function BuilderInventoryRow({
  label,
  itemLabel,
  meta,
  sourceLabel,
  onRemove,
}: BuilderInventoryRowProps) {
  return (
    <div className={builderInventoryRowClasses}>
      <div className={builderInventoryRowMetaClasses}>
        {label}
        {meta}
      </div>
      <div className={builderInventoryRowActionsClasses}>
        {sourceLabel ? (
          <Text variant="caption" className={builderInventoryRowSourceClasses}>
            {sourceLabel}
          </Text>
        ) : null}
        {onRemove ? (
          <button
            type="button"
            className={builderInventoryRowRemoveButtonClasses}
            aria-label={formatBuilderInventoryRowRemoveLabel(itemLabel)}
            onClick={onRemove}
          >
            <Trash2 aria-hidden className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
