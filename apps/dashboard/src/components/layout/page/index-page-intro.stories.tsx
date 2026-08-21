import type { Meta, StoryObj } from '@storybook/react-vite'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'

import { IndexPageEmptyState, IndexPageIntro } from './index-page-intro'

const meta = {
  title: 'Layout/IndexPageIntro',
  component: IndexPageIntro,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof IndexPageIntro>

export default meta

type Story = StoryObj<typeof IndexPageIntro>

const actions = (
  <Link to="/campaigns/new" className={buttonVariants({ size: 'sm' })}>
    New campaign
  </Link>
)

export const WithHeaderActions: Story = {
  render: () => (
    <IndexPageIntro
      title="Campaigns"
      description="Choose a campaign to continue, or start a new one."
      actions={actions}
      showActionsInHeader
    />
  ),
}

export const EmptyState: Story = {
  render: () => (
    <div className="space-y-6">
      <IndexPageIntro title="Campaigns" description="Create and manage shared game worlds." />
      <IndexPageEmptyState
        heading="You have not created or joined a campaign yet."
        body="Create one to invite players, organize sessions, and manage campaign content."
        actions={actions}
      />
    </div>
  ),
}
