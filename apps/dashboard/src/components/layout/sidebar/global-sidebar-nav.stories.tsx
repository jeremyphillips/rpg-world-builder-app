import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { GlobalSidebarNav } from './global-sidebar-nav'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

const meta = {
  title: 'Layout/Sidebar/GlobalSidebarNav',
  component: GlobalSidebarNav,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof GlobalSidebarNav>

export default meta
type Story = StoryObj<typeof GlobalSidebarNav>

export const Default: Story = {
  render: () => (
    <div className="w-60 bg-sidebar">
      <GlobalSidebarNav />
    </div>
  ),
}
