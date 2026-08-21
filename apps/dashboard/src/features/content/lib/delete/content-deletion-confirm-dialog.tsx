import type { ContentTypeKey } from '@rpg/contracts'
import { ConfirmDialog } from '@rpg/ui'

import {
  formatContentDeleteConfirmAction,
  formatContentDeleteConfirmHeadline,
} from '../content-type-labels'

export interface ContentDeletionConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contentTypeKey: ContentTypeKey
  entityName: string
  onConfirm: () => void
}

export function ContentDeletionConfirmDialog({
  open,
  onOpenChange,
  contentTypeKey,
  entityName,
  onConfirm,
}: ContentDeletionConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      headline={formatContentDeleteConfirmHeadline(entityName)}
      description={
        <>
          Permanently delete <strong>{entityName}</strong>? This cannot be undone.
        </>
      }
      confirmLabel={formatContentDeleteConfirmAction(contentTypeKey)}
      confirmVariant="destructive"
      onConfirm={onConfirm}
    />
  )
}
