import type { Meta, StoryObj } from '@storybook/react-vite'

import { GlobalSearchProvider } from '../global-search-provider'
import { GlobalSearchTopbar } from './global-search-topbar'

const meta = {
  title: 'GlobalSearch/GlobalSearchTopbar',
  component: GlobalSearchTopbar,
  decorators: [
    (Story) => (
      <GlobalSearchProvider>
        <div className="flex justify-end p-4">
          <Story />
        </div>
      </GlobalSearchProvider>
    ),
  ],
} satisfies Meta<typeof GlobalSearchTopbar>

export default meta
type Story = StoryObj<typeof meta>

export const Collapsed: Story = {}
