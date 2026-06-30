import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { SERVICE_LIST } from '../fixtures'
import { serviceColumns, serviceFilters } from './service-overview-columns'

const meta = {
  title: 'Content/Equipment/Services/ServiceOverviewColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={serviceColumns(STORY_CAMPAIGN_ID)}
      data={[...SERVICE_LIST]}
      filters={serviceFilters}
      caption="Services available in this campaign"
    />
  ),
}
