import type { Meta, StoryObj } from '@storybook/react-vite'
import { ThemeProvider } from '@rpg/ui'

import { withDashboardProviders } from '../../../../.storybook/decorators'

import { TopbarUserMenu } from './topbar-user-menu'

const meta = {
  title: 'Layout/TopbarUserMenu',
  component: TopbarUserMenu,
  decorators: [
    withDashboardProviders,
    (Story) => (
      <ThemeProvider>
        <div className="flex justify-end p-4">
          <Story />
        </div>
      </ThemeProvider>
    ),
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
