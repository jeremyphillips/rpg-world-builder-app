import { PageHeader } from '@/components/layout/page/page-header'
import { PageShell } from '@/components/layout/page/page-shell'
import { Text } from '@rpg/ui'

import { AdminUsersOverviewTable } from '../components/admin-users-overview-table'

export function AdminUsers() {
  return (
    <PageShell width="full">
      <PageHeader heading="Users" />
      <Text variant="muted" className="mb-6">
        Browse platform accounts, review activity, and manage test users.
      </Text>
      <AdminUsersOverviewTable />
    </PageShell>
  )
}
