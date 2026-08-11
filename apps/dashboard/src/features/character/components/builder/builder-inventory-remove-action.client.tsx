'use client'

import { Trash2 } from 'lucide-react'

import { cn } from '@rpg/ui'

export const BUILDER_INVENTORY_REMOVE_LABEL_PREFIX = 'Remove' as const

export function formatBuilderInventoryRemoveLabel(label: string): string {
  return `${BUILDER_INVENTORY_REMOVE_LABEL_PREFIX} ${label}`
}

export const builderInventoryRemoveButtonClasses =
  'flex size-8 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-control-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

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
      className={cn(builderInventoryRemoveButtonClasses, className)}
      aria-label={removeAriaLabel ?? formatBuilderInventoryRemoveLabel(itemLabel)}
      onClick={onRemove}
    >
      <Trash2 aria-hidden className="size-4" />
    </button>
  )
}
