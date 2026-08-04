'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AdminUserDeleteBlockReason } from '@rpg/contracts'
import { ConfirmDialog, Text } from '@rpg/ui'

import { deleteAdminUser, fetchAdminUserDeletionPreview } from '../api/admin-users-client'
import type { AdminUserDeleteSubject } from '../lib/admin-user-delete-subject'
import {
  buildDeleteDependencyLines,
  resolveOwnedCampaignBlockCopy,
} from '../lib/delete-user-dialog.lib'
import { getPrimaryDeleteBlockReasonMessage } from '../lib/admin-users-labels'

type DeleteUserDialogProps = {
  user: AdminUserDeleteSubject
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

const BLOCKED_HEADLINES: Partial<Record<AdminUserDeleteBlockReason, string>> = {
  self: 'You cannot delete your own account from the admin users table.',
  last_superadmin: 'This user is the last superadmin and cannot be deleted.',
}

function BlockedDeleteDialog({
  open,
  onOpenChange,
  headline,
  description,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  headline: string
  description?: React.ReactNode
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      headline={headline}
      description={description}
      cancelLabel="Close"
      confirmLabel="Close"
      onConfirm={() => onOpenChange(false)}
      onCancel={() => onOpenChange(false)}
    />
  )
}

function resolveBlockedDialog(
  user: AdminUserDeleteSubject,
  blockers: readonly AdminUserDeleteBlockReason[],
  preview: Awaited<ReturnType<typeof fetchAdminUserDeletionPreview>> | undefined,
  open: boolean,
  onOpenChange: (open: boolean) => void,
) {
  if (blockers.includes('owns_campaigns')) {
    return (
      <BlockedDeleteDialog
        open={open}
        onOpenChange={onOpenChange}
        headline="User cannot be deleted"
        description={<Text variant="muted">{resolveOwnedCampaignBlockCopy(user, preview)}</Text>}
      />
    )
  }

  for (const blocker of ['self', 'last_superadmin'] as const) {
    if (blockers.includes(blocker)) {
      return (
        <BlockedDeleteDialog
          open={open}
          onOpenChange={onOpenChange}
          headline={BLOCKED_HEADLINES[blocker]!}
        />
      )
    }
  }

  if (blockers.includes('character_referenced_by_locations')) {
    return (
      <BlockedDeleteDialog
        open={open}
        onOpenChange={onOpenChange}
        headline="User cannot be deleted"
        description={
          <Text variant="muted">
            {getPrimaryDeleteBlockReasonMessage(blockers) ??
              'One or more characters are linked from a location.'}
          </Text>
        }
      />
    )
  }

  return null
}

export function DeleteUserDialog({ user, open, onOpenChange, onDeleted }: DeleteUserDialogProps) {
  const queryClient = useQueryClient()
  const previewQuery = useQuery({
    queryKey: ['admin', 'users', user.id, 'deletion-preview'],
    queryFn: () => fetchAdminUserDeletionPreview(user.id),
    enabled: open,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdminUser(user.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      onOpenChange(false)
      onDeleted?.()
    },
  })

  const preview = previewQuery.data
  const blockers = preview?.blockers ?? user.deleteBlockedReasons
  const blockedDialog = resolveBlockedDialog(user, blockers, preview, open, onOpenChange)
  if (blockedDialog) return blockedDialog

  const dependencyLines = buildDeleteDependencyLines(preview?.dependencies)

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      headline="Delete user?"
      description={
        previewQuery.isPending ? (
          <Text variant="muted">Loading delete preview…</Text>
        ) : dependencyLines.length > 0 ? (
          <div className="space-y-3">
            <Text variant="muted">This will permanently delete {user.displayName} and remove:</Text>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {dependencyLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <Text variant="muted">This action cannot be undone.</Text>
          </div>
        ) : (
          <Text variant="muted">
            Delete {user.displayName} ({user.email})? This permanently deletes the account and
            cannot be undone.
          </Text>
        )
      }
      confirmLabel="Delete user"
      confirmVariant="destructive"
      onConfirm={() => {
        if (!previewQuery.isPending) {
          deleteMutation.mutate()
        }
      }}
    />
  )
}
