import type { AdminUserCampaignListItem } from '@rpg/contracts'
import { CAMPAIGN_ROLE_ENTRIES } from '@rpg/contracts'
import {
  dataTableColumnMeta,
  dataTableWidthMeta,
  SortableHeader,
  TableBadgeCell,
  type ColumnDef,
} from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { buildNameColumn } from '@/lib/data-table/column-builders'

import { formatAdminUserDetailJoined } from './admin-user-detail-labels'

export type AdminUserCampaignTableRow = AdminUserCampaignListItem & { id: string }

export function adminUserCampaignsColumns(): ColumnDef<AdminUserCampaignTableRow>[] {
  return [
    {
      ...buildNameColumn({
        accessorKey: 'name',
        label: 'Campaign',
        locked: true,
        nameHref: (row) => ROUTES.campaign.detail(row.campaign.id),
      }),
      accessorFn: (row) => row.campaign.name,
    },
    {
      id: 'role',
      accessorFn: (row) => row.membership.role,
      header: ({ column }) => <SortableHeader column={column}>Role</SortableHeader>,
      cell: ({ row }) => {
        const role = row.original.membership.role
        return (
          <TableBadgeCell appearance="outline" tone="neutral">
            {CAMPAIGN_ROLE_ENTRIES[role].label}
          </TableBadgeCell>
        )
      },
      meta: {
        ...dataTableColumnMeta.data,
        label: 'Role',
        ...dataTableWidthMeta('badge'),
      },
    },
    {
      id: 'characters',
      accessorFn: (row) => row.membership.controlledCharacterCount,
      header: 'Characters',
      cell: ({ row }) => {
        const count = row.original.membership.controlledCharacterCount
        const role = row.original.membership.role
        if (count === 0 || role === 'owner' || role === 'observer') return '—'
        return count
      },
      enableSorting: false,
      meta: {
        ...dataTableColumnMeta.data,
        label: 'Characters',
        ...dataTableWidthMeta('compactCenter'),
      },
    },
    {
      id: 'joinedAt',
      accessorFn: (row) => row.membership.joinedAt,
      header: ({ column }) => <SortableHeader column={column}>Joined</SortableHeader>,
      cell: ({ row }) => formatAdminUserDetailJoined(row.original.membership.joinedAt),
      meta: {
        ...dataTableColumnMeta.data,
        label: 'Joined',
        ...dataTableWidthMeta('medium'),
      },
    },
    {
      id: 'campaignCreatedAt',
      accessorFn: (row) => row.campaign.createdAt,
      header: ({ column }) => <SortableHeader column={column}>Campaign created</SortableHeader>,
      cell: ({ row }) => formatAdminUserDetailJoined(row.original.campaign.createdAt),
      meta: {
        ...dataTableColumnMeta.data,
        label: 'Campaign created',
        ...dataTableWidthMeta('medium'),
      },
    },
  ]
}
