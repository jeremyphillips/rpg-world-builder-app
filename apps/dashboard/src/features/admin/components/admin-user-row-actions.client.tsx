'use client'

import { useState } from 'react'
import type { AdminUserListItem } from '@rpg/contracts'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@rpg/ui'
import { Ellipsis, Trash2 } from 'lucide-react'

import { useIsSuperadmin } from '@/features/auth/hooks/use-is-superadmin'

import { DeleteUserDialog } from './delete-user-dialog.client'
import { getPrimaryDeleteBlockReasonMessage } from '../lib/admin-users-labels'

type AdminUserRowActionsProps = {
  user: AdminUserListItem
}

export function AdminUserRowActions({ user }: AdminUserRowActionsProps) {
  const isSuperadmin = useIsSuperadmin()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteDisabled = !isSuperadmin || !user.canDelete
  const deleteTooltip = !isSuperadmin
    ? 'Only superadmins can delete users'
    : getPrimaryDeleteBlockReasonMessage(user.deleteBlockedReasons)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            aria-label={`Open actions for ${user.displayName}`}
          >
            <Ellipsis className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="text-xs" disabled>
            View user
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs" disabled>
            View campaigns
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs" disabled>
            View characters
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {deleteDisabled ? (
            <DropdownMenuItem
              className="text-xs text-destructive focus:text-destructive [&_svg]:size-3"
              disabled
              title={deleteTooltip}
            >
              <Trash2 />
              Delete user
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="text-xs text-destructive focus:text-destructive [&_svg]:size-3"
              onSelect={() => setDeleteOpen(true)}
            >
              <Trash2 />
              Delete user
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteUserDialog user={user} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  )
}
