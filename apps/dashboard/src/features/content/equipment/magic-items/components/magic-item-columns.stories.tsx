import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { MAGIC_ITEM_LIST } from '../fixtures'
import { magicItemColumns, magicItemFilters } from './magic-item-columns'

const meta = {
  title: 'Content/Equipment/Magic Items/MagicItemColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={magicItemColumns(STORY_CAMPAIGN_ID)}
      data={[...MAGIC_ITEM_LIST]}
      filters={magicItemFilters}
      caption="Magic items available in this campaign"
    />
  ),
}
