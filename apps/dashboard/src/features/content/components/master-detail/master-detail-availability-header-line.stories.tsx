import type { Meta, StoryObj } from '@storybook/react-vite'

import { buildMasterDetailAvailabilityPresentation } from '../../lib/master-detail/master-detail-availability.types'
import { MasterDetailAvailabilityHeaderLine } from './master-detail-availability-header-line'

const meta = {
  title: 'Content/MasterDetail/MasterDetailAvailabilityHeaderLine',
  component: MasterDetailAvailabilityHeaderLine,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof MasterDetailAvailabilityHeaderLine>

export default meta
type Story = StoryObj<typeof meta>

export const Available: Story = {
  args: {
    availability: buildMasterDetailAvailabilityPresentation('row-1', true),
    onAvailabilityChange: () => {},
  },
}

export const Unavailable: Story = {
  args: {
    availability: buildMasterDetailAvailabilityPresentation('row-2', false),
    onAvailabilityChange: () => {},
  },
}
