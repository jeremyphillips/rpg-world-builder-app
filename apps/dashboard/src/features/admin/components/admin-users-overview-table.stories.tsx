import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AdminUsersOverviewTable } from '../components/admin-users-overview-table'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const meta = {
  title: 'Dashboard/Admin/UsersOverviewTable',
  component: AdminUsersOverviewTable,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof AdminUsersOverviewTable>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
