import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { EQUIPMENT_LIST } from '../fixtures'
import { equipmentColumns } from './equipment-overview-columns'

const meta = {
  title: 'Content/Equipment/EquipmentOverviewColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={equipmentColumns(STORY_CAMPAIGN_ID)}
      data={[...EQUIPMENT_LIST]}
      caption="Equipment available in this campaign"
    />
  ),
}
