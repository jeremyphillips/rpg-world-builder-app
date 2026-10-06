import { ActionIcon, cn, iconGhostControlVariants } from '@rpg/ui'

import { formatBuilderInventoryRemoveLabel } from './builder-inventory-remove-action.lib'

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
      className={cn(iconGhostControlVariants({ hover: 'accent', layout: 'flex' }), className)}
      aria-label={removeAriaLabel ?? formatBuilderInventoryRemoveLabel(itemLabel)}
      onClick={onRemove}
    >
      <ActionIcon action="remove" step="md" />
    </button>
  )
}
