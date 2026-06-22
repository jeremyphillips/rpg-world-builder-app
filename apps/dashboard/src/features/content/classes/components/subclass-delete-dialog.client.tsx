import { ConfirmDialog } from '@rpg/ui'

export interface SubclassDeleteDialogProps {
  open: boolean
  subclassName: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function SubclassDeleteDialog({
  open,
  subclassName,
  onOpenChange,
  onConfirm,
}: SubclassDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      headline="Delete subclass?"
      description={
        <>
          Permanently delete <strong>{subclassName}</strong>? This cannot be undone.
        </>
      }
      confirmLabel="Delete"
      confirmVariant="destructive"
      onConfirm={onConfirm}
    />
  )
}
