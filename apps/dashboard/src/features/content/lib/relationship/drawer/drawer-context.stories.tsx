import type { Meta, StoryObj } from '@storybook/react-vite'

import { DrawerContext } from './drawer-context'

const meta = {
  title: 'Content/Relationship/DrawerContext',
  component: DrawerContext,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DrawerContext>

export default meta
type Story = StoryObj<typeof DrawerContext>

export const SingleLocation: Story = {
  args: {
    entities: [
      {
        heading: 'Yawning Portal',
        classification: 'Building · Tavern',
        supportingText: 'Located in Dock Ward',
      },
    ],
  },
}

export const LocationAndOrganization: Story = {
  args: {
    entities: [
      {
        heading: 'Port City',
        classification: 'Settlement · City',
      },
      {
        heading: 'City Council',
        classification: 'Organization',
      },
    ],
  },
}

export const LinkedName: Story = {
  args: {
    entities: [
      {
        heading: 'The Monarchy',
        classification: 'Organization',
        href: '/campaigns/demo/organizations/monarchy',
      },
    ],
  },
}
