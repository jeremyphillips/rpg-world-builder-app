'use client'

import { useState } from 'react'
import { ConfirmDialog, RowActionsMenu } from '@rpg/ui'
import { Pencil, Trash2 } from 'lucide-react'
import type { VocabularyOptionWithUsage } from '@rpg/contracts'

type VocabularyRowActionsProps = {
  entry: VocabularyOptionWithUsage
  canManage: boolean
  onEdit: (entry: VocabularyOptionWithUsage) => void
  onToggleStatus: (entry: VocabularyOptionWithUsage) => void
  onDelete: (entry: VocabularyOptionWithUsage) => void
}

/** Row actions for vocabulary table — edit, enable/disable, delete custom entries. */
export function VocabularyRowActions({
  entry,
  canManage,
  onEdit,
  onToggleStatus,
  onDelete,
}: VocabularyRowActionsProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  if (!canManage) return null

  const isActive = entry.status === 'active'
  const canDelete = entry.source === 'campaign'

  return (
    <>
      <RowActionsMenu
        triggerLabel={`Open actions for ${entry.label}`}
        contentClassName="w-44"
        items={[
          {
            kind: 'action',
            id: 'edit',
            label: 'Edit',
            icon: <Pencil />,
            onSelect: () => onEdit(entry),
          },
          {
            kind: 'action',
            id: 'toggle-status',
            label: isActive ? 'Disable' : 'Enable',
            onSelect: () => onToggleStatus(entry),
          },
          ...(canDelete
            ? [
                {
                  kind: 'action' as const,
                  id: 'delete',
                  label: 'Delete',
                  icon: <Trash2 />,
                  destructive: true,
                  separatorBefore: true,
                  onSelect: () => setConfirmDeleteOpen(true),
                },
              ]
            : []),
        ]}
      />

      {canDelete ? (
        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          headline="Delete vocabulary entry?"
          description={
            <>
              Permanently delete <strong>{entry.label}</strong>? This cannot be undone.
            </>
          }
          confirmLabel="Delete"
          confirmVariant="destructive"
          onConfirm={() => {
            onDelete(entry)
            setConfirmDeleteOpen(false)
          }}
        />
      ) : null}
    </>
  )
}
