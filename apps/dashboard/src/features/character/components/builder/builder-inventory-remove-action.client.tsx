'use client'

import { Trash2 } from 'lucide-react'

import { cn, iconGhostControlVariants } from '@rpg/ui'

export const BUILDER_INVENTORY_REMOVE_LABEL_PREFIX = 'Remove' as const

export function formatBuilderInventoryRemoveLabel(label: string): string {
  return `${BUILDER_INVENTORY_REMOVE_LABEL_PREFIX} ${label}`
}

type BuilderInventoryRemoveActionProps = {
  itemLabel: string
  removeAriaLabel?: string
  onRemove: () => void
  className?: string
}

export function BuilderInventoryRemoveAction({
  itemLabel,
  removeAriaLabel,
  onRemove,
  className,
}: BuilderInventoryRemoveActionProps) {
  return (
    <button
      type="button"
      className={cn(
        iconGhostControlVariants({ size: 'comfortable', hover: 'accent', layout: 'flex' }),
        className,
      )}
      aria-label={removeAriaLabel ?? formatBuilderInventoryRemoveLabel(itemLabel)}
      onClick={onRemove}
    >
      <Trash2 aria-hidden className="size-4" />
    </button>
  )
}
