import type { Meta, StoryObj } from '@storybook/react-vite'

import { SidebarNavSectionDisclosure } from './sidebar-nav-section-disclosure.client'
import { sidebarNavItemVariants } from './sidebar-nav-item.variants'

const meta = {
  title: 'Navigation/SidebarNavSectionDisclosure',
  component: SidebarNavSectionDisclosure,
} satisfies Meta<typeof SidebarNavSectionDisclosure>

export default meta
type Story = StoryObj<typeof SidebarNavSectionDisclosure>

export const Expanded: Story = {
  render: () => (
    <div className="w-60 bg-sidebar p-3">
      <SidebarNavSectionDisclosure label="Campaign" expanded onExpandedChange={() => undefined}>
        <a href="/campaigns/demo" className={sidebarNavItemVariants({ active: true })}>
          Overview
        </a>
        <a href="/campaigns/demo/sessions" className={sidebarNavItemVariants({ active: false })}>
          Sessions
        </a>
      </SidebarNavSectionDisclosure>
    </div>
  ),
}

export const DisabledActiveSection: Story = {
  render: () => (
    <div className="w-60 bg-sidebar p-3">
      <SidebarNavSectionDisclosure
        label="Campaign"
        expanded
        disabled
        onExpandedChange={() => undefined}
      >
        <a href="/campaigns/demo" className="block rounded-md px-3 py-2 text-sm">
          Overview
        </a>
      </SidebarNavSectionDisclosure>
    </div>
  ),
}

export const Collapsed: Story = {
  render: () => (
    <div className="w-60 bg-sidebar p-3">
      <SidebarNavSectionDisclosure
        label="World"
        expanded={false}
        onExpandedChange={() => undefined}
      >
        <a href="/campaigns/demo/npcs" className={sidebarNavItemVariants({ active: false })}>
          NPCs
        </a>
      </SidebarNavSectionDisclosure>
    </div>
  ),
}
