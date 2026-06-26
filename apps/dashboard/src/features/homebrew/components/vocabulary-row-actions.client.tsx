'use client'

import { useState } from 'react'
import {
  Button,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@rpg/ui'
import { Ellipsis, Pencil, Trash2 } from 'lucide-react'
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            aria-label={`Open actions for ${entry.label}`}
          >
            <Ellipsis className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem className="text-xs [&_svg]:size-3" onSelect={() => onEdit(entry)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs" onSelect={() => onToggleStatus(entry)}>
            {isActive ? 'Disable' : 'Enable'}
          </DropdownMenuItem>
          {canDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-xs text-destructive focus:text-destructive [&_svg]:size-3"
                onSelect={() => setConfirmDeleteOpen(true)}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

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
