import type { Meta, StoryObj } from '@storybook/react-vite'

import { CollapsibleNavSection } from './collapsible-nav-section.client'
import { NavItem } from './nav-item'

const meta = {
  title: 'Layout/Sidebar/CollapsibleNavSection',
  component: CollapsibleNavSection,
} satisfies Meta<typeof CollapsibleNavSection>

export default meta
type Story = StoryObj<typeof CollapsibleNavSection>

export const Expanded: Story = {
  render: () => (
    <div className="w-60 bg-sidebar p-3">
      <CollapsibleNavSection label="Campaign" expanded onExpandedChange={() => undefined}>
        <NavItem to="/campaigns/demo" label="Overview" end />
        <NavItem to="/campaigns/demo/sessions" label="Sessions" />
      </CollapsibleNavSection>
    </div>
  ),
}

export const Collapsed: Story = {
  render: () => (
    <div className="w-60 bg-sidebar p-3">
      <CollapsibleNavSection label="World" expanded={false} onExpandedChange={() => undefined}>
        <NavItem to="/campaigns/demo/npcs" label="NPCs" />
      </CollapsibleNavSection>
    </div>
  ),
}
