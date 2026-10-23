import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon } from './icon/icon'
import { sidebarNavItemVariants } from './sidebar-nav-item.variants'

const meta = {
  title: 'Navigation/SidebarNavItem',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Active: Story = {
  render: () => (
    <div className="w-60 bg-sidebar p-3">
      <a href="#active" className={sidebarNavItemVariants({ active: true })} aria-current="page">
        <Icon name="layout-dashboard" size="owner" />
        Dashboard
      </a>
    </div>
  ),
}

export const Inactive: Story = {
  render: () => (
    <div className="w-60 bg-sidebar p-3">
      <a href="#inactive" className={sidebarNavItemVariants({ active: false })}>
        <Icon name="castle" size="owner" />
        Campaigns
      </a>
    </div>
  ),
}
