import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { SiteHeaderUserMenu } from './site-header-user-menu.client'

const meta = {
  title: 'Layout/SiteHeaderUserMenu',
  component: SiteHeaderUserMenu,
  decorators: [
    (Story) => {
      const queryClient = new QueryClient()
      return (
        <QueryClientProvider client={queryClient}>
          <div className="flex justify-end p-4">
            <Story />
          </div>
        </QueryClientProvider>
      )
    },
  ],
} satisfies Meta<typeof SiteHeaderUserMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    user: {
      id: 'u1',
      email: 'dm@example.com',
      displayName: 'Dungeon Master',
      role: 'user',
      lastSelectedCampaignId: null,
    },
  },
}
