import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'

import { AvailabilityAlert } from './availability-alert.client'
import { resolveAvailability } from './availability'

const meta = {
  title: 'Availability/AvailabilityAlert',
  component: AvailabilityAlert,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    context: { campaignId: 'camp_1' },
  },
} satisfies Meta<typeof AvailabilityAlert>

export default meta
type Story = StoryObj<typeof meta>

export const SubclassesDisabled: Story = {
  args: {
    availability: resolveAvailability([
      { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
    ]),
  },
}

export const MulticlassingDisabled: Story = {
  args: {
    availability: resolveAvailability([
      { code: 'multiclassing-disabled', settingId: 'characterCreation.multiclassing.enabled' },
    ]),
  },
}

export const MultipleReasons: Story = {
  args: {
    availability: resolveAvailability([
      { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
      { code: 'not-available-in-campaign' },
    ]),
  },
}
