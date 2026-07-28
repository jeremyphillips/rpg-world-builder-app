'use client'

import { PageHeader } from '@/components/layout/page-header'
import { WidePage } from '@/components/layout/wide-page'
import { Text } from '@rpg/ui'

import { AdminUsersOverviewTable } from '../components/admin-users-overview-table.client'

export function AdminUsers() {
  return (
    <WidePage>
      <PageHeader heading="Users" />
      <Text variant="muted" className="mb-6">
        Browse platform accounts, review activity, and manage test users.
      </Text>
      <AdminUsersOverviewTable />
    </WidePage>
  )
}
