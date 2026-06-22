import { ConfirmDialog } from '@rpg/ui'

export interface MasterDetailDeleteDialogProps {
  open: boolean
  /** Singular noun for the item being removed (e.g. "feature"). */
  itemNoun: string
  /** Display name of the item, shown in bold. */
  itemName: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * Generic delete confirmation for a master-detail list row. Thin wrapper over
 * `ConfirmDialog` so every embedded editor (features, traits, heritage options,
 * subclasses) shares one removal UX.
 */
export function MasterDetailDeleteDialog({
  open,
  itemNoun,
  itemName,
  onOpenChange,
  onConfirm,
}: MasterDetailDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      headline={`Delete ${itemNoun}?`}
      description={
        <>
          Permanently delete <strong>{itemName}</strong>? This cannot be undone.
        </>
      }
      confirmLabel="Delete"
      confirmVariant="destructive"
      onConfirm={onConfirm}
    />
  )
}
