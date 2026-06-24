import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { ARMOR_LIST } from '../fixtures'
import { armorColumns, armorFilters } from './armor-columns'

const meta = {
  title: 'Content/Equipment/Armor/ArmorColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={armorColumns(STORY_CAMPAIGN_ID)}
      data={[...ARMOR_LIST]}
      filters={armorFilters}
      caption="Armor available in this campaign"
    />
  ),
}
