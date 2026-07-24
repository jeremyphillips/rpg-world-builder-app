import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { ADVENTURING_GEAR_LIST } from '../fixtures'
import { adventuringGearColumns } from './adventuring-gear-overview-columns'

const meta = {
  title: 'Content/Equipment/Adventuring Gear/AdventuringGearOverviewColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={adventuringGearColumns(STORY_CAMPAIGN_ID)}
      data={[...ADVENTURING_GEAR_LIST]}
      caption="Adventuring gear available in this campaign"
    />
  ),
}
