import type { Meta, StoryObj } from '@storybook/react-vite'

import { NavSection } from './nav-section'
import { sidebarNavItemVariants } from './sidebar-nav-item.variants'

const meta = {
  title: 'Navigation/NavSection',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-60 bg-sidebar p-3">
      <NavSection label="Main">
        <a href="#dashboard" className={sidebarNavItemVariants({ active: true })}>
          Dashboard
        </a>
        <a href="#campaigns" className={sidebarNavItemVariants({ active: false })}>
          Campaigns
        </a>
      </NavSection>
    </div>
  ),
}
