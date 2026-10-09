export const BUILDER_INVENTORY_REMOVE_LABEL_PREFIX = 'Remove' as const

export function formatBuilderInventoryRemoveLabel(label: string): string {
  return `${BUILDER_INVENTORY_REMOVE_LABEL_PREFIX} ${label}`
}
