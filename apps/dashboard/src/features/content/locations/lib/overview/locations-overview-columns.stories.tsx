import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { LOCATIONS_LIST } from '../../fixtures'
import { locationsColumns } from './locations-overview-columns'

const meta = {
  title: 'Content/Locations/LocationsOverviewColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={locationsColumns(STORY_CAMPAIGN_ID, { locations: [...LOCATIONS_LIST] })}
      data={[...LOCATIONS_LIST]}
      caption="Locations available in this campaign"
    />
  ),
}
