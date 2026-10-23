import type { Meta, StoryObj } from '@storybook/react-vite'

import { NavItem } from './nav-item'

const meta = {
  title: 'Layout/Sidebar/NavItem',
  component: NavItem,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof NavItem>

export default meta
type Story = StoryObj<typeof meta>

export const Inactive: Story = {
  args: {
    to: '/campaigns',
    label: 'Campaigns',
    icon: 'castle',
  },
  render: (args) => (
    <div className="w-60 bg-sidebar p-3">
      <NavItem {...args} />
    </div>
  ),
}

export const Active: Story = {
  args: {
    to: '/',
    label: 'Dashboard',
    icon: 'layout-dashboard',
    end: true,
  },
  render: (args) => (
    <div className="w-60 bg-sidebar p-3">
      <NavItem {...args} />
    </div>
  ),
}
