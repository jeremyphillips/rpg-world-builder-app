'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { AdminUserListItem } from '@rpg/contracts'
import { RowActionsMenu, type RowActionsMenuLinkProps } from '@rpg/ui'
import { Trash2 } from 'lucide-react'

import { useIsSuperadmin } from '@/features/auth'
import { ROUTES } from '@/app/routes'

import { DeleteUserDialog } from './delete-user-dialog.client'
import { getPrimaryDeleteBlockReasonMessage } from '../lib/admin-users-labels'

type AdminUserRowActionsProps = {
  user: AdminUserListItem
}

function AdminUserRouterLink({ href, className, children }: RowActionsMenuLinkProps) {
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  )
}

export function AdminUserRowActions({ user }: AdminUserRowActionsProps) {
  const isSuperadmin = useIsSuperadmin()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteDisabled = !isSuperadmin || !user.canDelete
  const deleteReason = !isSuperadmin
    ? 'Only superadmins can delete users'
    : getPrimaryDeleteBlockReasonMessage(user.deleteBlockedReasons)

  return (
    <>
      <RowActionsMenu
        triggerLabel={`Open actions for ${user.displayName}`}
        LinkComponent={AdminUserRouterLink}
        items={[
          {
            kind: 'link',
            id: 'view-user',
            label: 'View user',
            href: ROUTES.admin.user.detail(user.id),
          },
          {
            kind: 'link',
            id: 'view-campaigns',
            label: 'View campaigns',
            href: ROUTES.admin.user.campaigns(user.id),
          },
          {
            kind: 'link',
            id: 'view-characters',
            label: 'View characters',
            href: ROUTES.admin.user.characters(user.id),
          },
          {
            kind: 'action',
            id: 'delete-user',
            label: 'Delete user',
            icon: <Trash2 />,
            destructive: true,
            separatorBefore: true,
            disabled: deleteDisabled,
            disabledReason: deleteReason,
            onSelect: () => setDeleteOpen(true),
          },
        ]}
      />

      <DeleteUserDialog user={user} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  )
}
