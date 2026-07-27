import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

import { AdminUsersOverviewTable } from '../components/admin-users-overview-table.client'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const meta = {
  title: 'Dashboard/Admin/UsersOverviewTable',
  component: AdminUsersOverviewTable,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof AdminUsersOverviewTable>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
