import type { Meta, StoryObj } from '@storybook/react-vite'

import { DrawerContext } from './drawer-context.client'

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
        headingSuffix: ' · Building · Tavern',
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
        headingSuffix: ' · Settlement · City',
      },
      {
        heading: 'City Council',
        headingSuffix: ' · Organization',
      },
    ],
  },
}

export const LinkedName: Story = {
  args: {
    entities: [
      {
        heading: 'The Monarchy',
        headingSuffix: ' · Organization',
        href: '/campaigns/demo/organizations/monarchy',
      },
    ],
  },
}
