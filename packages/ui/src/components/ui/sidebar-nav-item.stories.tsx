import type { Meta, StoryObj } from '@storybook/react-vite'
import { Castle, LayoutDashboard } from 'lucide-react'

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
        <LayoutDashboard className="size-4.5 shrink-0" size={18} strokeWidth={1.75} aria-hidden />
        Dashboard
      </a>
    </div>
  ),
}

export const Inactive: Story = {
  render: () => (
    <div className="w-60 bg-sidebar p-3">
      <a href="#inactive" className={sidebarNavItemVariants({ active: false })}>
        <Castle className="size-4.5 shrink-0" size={18} strokeWidth={1.75} aria-hidden />
        Campaigns
      </a>
    </div>
  ),
}
