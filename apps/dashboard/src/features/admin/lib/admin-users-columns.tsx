import { Link } from 'react-router-dom'
import {
  SortableHeader,
  TableBadgeCell,
  Text,
  dataTableColumnMeta,
  dataTableNameLinkCellVariants,
  dataTableWidthMeta,
} from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import type { AdminUserListItem } from '@rpg/contracts'
import { PLATFORM_ROLE_ENTRIES } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import {
  formatAdminUserCampaignCounts,
  formatAdminUserJoined,
  formatAdminUserLastActive,
} from './admin-users-labels'

export function adminUsersColumns(): ColumnDef<AdminUserListItem>[] {
  return [
    {
      accessorKey: 'displayName',
      header: ({ column }) => <SortableHeader column={column}>User</SortableHeader>,
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <Link
              to={ROUTES.admin.user.detail(user.id)}
              className={dataTableNameLinkCellVariants({ className: 'truncate font-medium' })}
            >
              {user.displayName}
            </Link>
            <Text as="span" variant="muted" className="truncate text-xs">
              {user.email}
            </Text>
          </div>
        )
      },
      meta: {
        ...dataTableColumnMeta.identity,
        label: 'User',
        locked: true,
        ...dataTableWidthMeta('title'),
      },
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <SortableHeader column={column}>Access</SortableHeader>,
      cell: ({ row }) => {
        const role = row.original.role
        return (
          <TableBadgeCell appearance="outline" tone="neutral">
            {PLATFORM_ROLE_ENTRIES[role].label}
          </TableBadgeCell>
        )
      },
      meta: {
        ...dataTableColumnMeta.data,
        label: 'Access',
        ...dataTableWidthMeta('badge'),
      },
    },
    {
      id: 'campaigns',
      accessorFn: (row) => formatAdminUserCampaignCounts(row.campaignCounts),
      header: 'Campaigns',
      cell: ({ row }) => formatAdminUserCampaignCounts(row.original.campaignCounts),
      enableSorting: false,
      meta: {
        ...dataTableColumnMeta.data,
        label: 'Campaigns',
        ...dataTableWidthMeta('medium'),
      },
    },
    {
      accessorKey: 'characterCount',
      header: 'Characters',
      cell: ({ row }) => row.original.characterCount,
      enableSorting: false,
      meta: {
        ...dataTableColumnMeta.data,
        label: 'Characters',
        ...dataTableWidthMeta('compactCenter'),
      },
    },
    {
      accessorKey: 'lastActiveAt',
      header: ({ column }) => <SortableHeader column={column}>Last active</SortableHeader>,
      cell: ({ row }) => {
        const { label, absoluteLabel } = formatAdminUserLastActive(row.original.lastActiveAt)
        return (
          <span title={absoluteLabel} aria-label={`Last active: ${absoluteLabel}`}>
            {label}
          </span>
        )
      },
      meta: {
        ...dataTableColumnMeta.data,
        label: 'Last active',
        ...dataTableWidthMeta('medium'),
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <SortableHeader column={column}>Joined</SortableHeader>,
      cell: ({ row }) => formatAdminUserJoined(row.original.createdAt),
      meta: {
        ...dataTableColumnMeta.data,
        label: 'Joined',
        ...dataTableWidthMeta('medium'),
      },
    },
  ]
}
