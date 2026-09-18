import { ConfirmDialog } from '@rpg/ui'

import {
  TABLE_BUILDER_COLUMN_DELETE_CONFIRM_DESCRIPTION,
  TABLE_BUILDER_COLUMN_DELETE_CONFIRM_HEADLINE,
  TABLE_BUILDER_COLUMN_DELETE_CONFIRM_LABEL,
  TABLE_BUILDER_LAST_COLUMN_DELETE_CONFIRM_DESCRIPTION,
  TABLE_BUILDER_LAST_COLUMN_DELETE_CONFIRM_HEADLINE,
  TABLE_BUILDER_TYPE_CHANGE_CONFIRM_DESCRIPTION,
  TABLE_BUILDER_TYPE_CHANGE_CONFIRM_HEADLINE,
  TABLE_BUILDER_TYPE_CHANGE_CONFIRM_LABEL,
} from '../../lib/table-builder/table-builder-copy'
import type { TableBuilderColumnDeleteIntent } from '../../lib/table-builder/table-builder-draft'

type PendingTypeChange = {
  index: number
  valueType: string
}

type PendingColumnDelete = {
  index: number
  reason: Extract<TableBuilderColumnDeleteIntent, { action: 'confirm' }>['reason']
}

export type TableBuilderColumnsConfirmDialogsProps = {
  pendingTypeChange: PendingTypeChange | null
  pendingColumnDelete: PendingColumnDelete | null
  onPendingTypeChangeOpenChange: (open: boolean) => void
  onPendingColumnDeleteOpenChange: (open: boolean) => void
  onConfirmTypeChange: () => void
  onConfirmColumnDelete: () => void
}

export function TableBuilderColumnsConfirmDialogs({
  pendingTypeChange,
  pendingColumnDelete,
  onPendingTypeChangeOpenChange,
  onPendingColumnDeleteOpenChange,
  onConfirmTypeChange,
  onConfirmColumnDelete,
}: TableBuilderColumnsConfirmDialogsProps) {
  return (
    <>
      <ConfirmDialog
        open={pendingTypeChange !== null}
        onOpenChange={onPendingTypeChangeOpenChange}
        headline={TABLE_BUILDER_TYPE_CHANGE_CONFIRM_HEADLINE}
        description={TABLE_BUILDER_TYPE_CHANGE_CONFIRM_DESCRIPTION}
        confirmLabel={TABLE_BUILDER_TYPE_CHANGE_CONFIRM_LABEL}
        confirmVariant="destructive"
        onConfirm={onConfirmTypeChange}
      />

      <ConfirmDialog
        open={pendingColumnDelete !== null}
        onOpenChange={onPendingColumnDeleteOpenChange}
        headline={
          pendingColumnDelete?.reason === 'lastColumnWithRows'
            ? TABLE_BUILDER_LAST_COLUMN_DELETE_CONFIRM_HEADLINE
            : TABLE_BUILDER_COLUMN_DELETE_CONFIRM_HEADLINE
        }
        description={
          pendingColumnDelete?.reason === 'lastColumnWithRows'
            ? TABLE_BUILDER_LAST_COLUMN_DELETE_CONFIRM_DESCRIPTION
            : TABLE_BUILDER_COLUMN_DELETE_CONFIRM_DESCRIPTION
        }
        confirmLabel={TABLE_BUILDER_COLUMN_DELETE_CONFIRM_LABEL}
        confirmVariant="destructive"
        onConfirm={onConfirmColumnDelete}
      />
    </>
  )
}
