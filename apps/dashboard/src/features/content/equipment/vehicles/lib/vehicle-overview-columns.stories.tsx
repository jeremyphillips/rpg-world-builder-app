import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { VEHICLE_LIST } from '../fixtures'
import { vehicleColumns } from './vehicle-overview-columns'

const meta = {
  title: 'Content/Equipment/Vehicles/VehicleOverviewColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={vehicleColumns(STORY_CAMPAIGN_ID)}
      data={[...VEHICLE_LIST]}
      caption="Vehicles available in this campaign"
    />
  ),
}
