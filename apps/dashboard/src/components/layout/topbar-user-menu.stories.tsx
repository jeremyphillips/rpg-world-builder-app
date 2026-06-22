import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@rpg/ui'

import { TopbarUserMenu } from './topbar-user-menu'

const meta = {
  title: 'Layout/TopbarUserMenu',
  component: TopbarUserMenu,
  decorators: [
    (Story) => {
      const queryClient = new QueryClient()
      return (
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <MemoryRouter>
              <div className="flex justify-end p-4">
                <Story />
              </div>
            </MemoryRouter>
          </ThemeProvider>
        </QueryClientProvider>
      )
    },
  ],
} satisfies Meta<typeof TopbarUserMenu>

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
