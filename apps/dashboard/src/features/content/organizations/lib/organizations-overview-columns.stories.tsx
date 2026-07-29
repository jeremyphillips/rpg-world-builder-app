import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { ORGANIZATIONS_LIST } from '../fixtures'
import { organizationsColumns } from './organizations-overview-columns'

const meta = {
  title: 'Content/Organizations/OrganizationsOverviewColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={organizationsColumns(STORY_CAMPAIGN_ID)}
      data={[...ORGANIZATIONS_LIST]}
      caption="Organizations available in this campaign"
    />
  ),
}
