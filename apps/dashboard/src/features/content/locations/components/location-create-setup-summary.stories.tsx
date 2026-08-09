import type { Meta, StoryObj } from '@storybook/react-vite'

import { LocationCreateSetupSummary } from './location-create-setup-summary.client'

const meta = {
  title: 'Content/Locations/LocationCreateSetupSummary',
  component: LocationCreateSetupSummary,
} satisfies Meta<typeof LocationCreateSetupSummary>

export default meta
type Story = StoryObj<typeof LocationCreateSetupSummary>

export const Single: Story = {
  args: {
    entries: [{ fieldLabel: 'Settlement type', valueLabel: 'City' }],
    onChange: () => undefined,
  },
}

export const Multiple: Story = {
  args: {
    entries: [
      { fieldLabel: 'Classification', valueLabel: 'Political' },
      { fieldLabel: 'Region type', valueLabel: 'Duchy' },
    ],
    onChange: () => undefined,
  },
}
