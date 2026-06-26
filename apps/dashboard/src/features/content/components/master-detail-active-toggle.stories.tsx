import { action } from 'storybook/actions'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { MasterDetailActiveToggle } from './master-detail-active-toggle.client'

const meta = {
  title: 'Content/MasterDetailActiveToggle',
  component: MasterDetailActiveToggle,
  parameters: { layout: 'padded' },
  args: {
    controlId: 'row-active',
    activeInCampaign: true,
    onActiveChange: action('onActiveChange'),
  },
} satisfies Meta<typeof MasterDetailActiveToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Active: Story = {}

export const Inactive: Story = {
  args: {
    activeInCampaign: false,
  },
}
