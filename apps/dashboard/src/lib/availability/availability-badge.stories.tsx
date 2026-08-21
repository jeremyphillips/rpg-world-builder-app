import type { Meta, StoryObj } from '@storybook/react-vite'

import { AvailabilityBadge } from './availability-badge'
import { resolveAvailability } from './availability'

const meta = {
  title: 'Availability/AvailabilityBadge',
  component: AvailabilityBadge,
} satisfies Meta<typeof AvailabilityBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Inactive: Story = {
  args: {
    availability: resolveAvailability([
      { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
    ]),
  },
}
