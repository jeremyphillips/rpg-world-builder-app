import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'

import { LocationConnectionKindField } from './location-connection-kind-field.client'

const meta = {
  title: 'Dashboard/Content/LocationConnectionKindField',
  component: LocationConnectionKindField,
  parameters: { layout: 'padded' },
  args: {
    id: 'connection-kind',
    label: 'Connection type',
    value: null,
    onValueChange: fn(),
  },
} satisfies Meta<typeof LocationConnectionKindField>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    options: [],
  },
}

export const SingleOptionLock: Story = {
  args: {
    options: [
      {
        value: 'operates_in',
        label: 'Operates in',
        description: 'Has geographic activity here without site ownership.',
      },
    ],
  },
}

export const MultiOptionRadios: Story = {
  args: {
    label: 'Authority type',
    options: [
      {
        value: 'governs',
        label: 'Governs',
        description: 'Exercises political authority over this region.',
      },
      {
        value: 'controls',
        label: 'Controls',
        description: 'Exercises military or coercive control over this region.',
      },
    ],
  },
}

export const DisabledReason: Story = {
  args: {
    label: 'Relationship type',
    options: [
      {
        value: 'headquarters',
        label: 'Headquarters',
        description: 'A designated primary base or headquarters location for the organization.',
        disabled: true,
        disabledReason: 'Already set at Thieves Guildhouse.',
      },
      {
        value: 'owns',
        label: 'Owner',
        description: 'Owns or holds title to a property or site.',
      },
    ],
  },
}
