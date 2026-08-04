import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '@rpg/ui'

import { LocationLinkedEntityCard } from './location-linked-entity-card.client'

const meta = {
  title: 'Content/Locations/LocationLinkedEntityCard',
  component: LocationLinkedEntityCard,
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LocationLinkedEntityCard>

export default meta

type Story = StoryObj<typeof LocationLinkedEntityCard>

export const Linked: Story = {
  args: {
    name: 'Dock Ward',
    href: '/campaigns/camp_story/locations/location-dock-ward',
    summaryLine: 'District',
  },
}

export const WithMeta: Story = {
  args: {
    name: 'Unavailable character',
    summaryLine: 'Dwarf · Level 4 Fighter',
    meta: <Badge tone="warning">Unavailable</Badge>,
  },
}
