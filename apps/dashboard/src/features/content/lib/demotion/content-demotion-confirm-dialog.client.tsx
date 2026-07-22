import { ConfirmDialog } from '@rpg/ui'

import {
  formatContentDemoteConfirmDescription,
  formatContentDemoteConfirmHeadline,
} from '../content-type-labels'

export interface ContentDemotionConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityName: string
  onConfirm: () => void
}

export function ContentDemotionConfirmDialog({
  open,
  onOpenChange,
  entityName,
  onConfirm,
}: ContentDemotionConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      headline={formatContentDemoteConfirmHeadline(entityName)}
      description={
        <>
          Move <strong>{entityName}</strong> to draft? {formatContentDemoteConfirmDescription()}
        </>
      }
      confirmLabel="Move to draft"
      onConfirm={onConfirm}
    />
  )
}
