import type { Meta, StoryObj } from '@storybook/react-vite'

import { AllCampaignsLink } from './all-campaigns-link'

const meta = {
  title: 'Layout/Sidebar/AllCampaignsLink',
  component: AllCampaignsLink,
} satisfies Meta<typeof AllCampaignsLink>

export default meta
type Story = StoryObj<typeof AllCampaignsLink>

export const Default: Story = {
  render: () => (
    <div className="w-60 bg-sidebar p-3">
      <AllCampaignsLink />
    </div>
  ),
}
