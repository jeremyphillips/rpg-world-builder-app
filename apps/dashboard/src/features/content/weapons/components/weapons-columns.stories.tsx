import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { WEAPONS_LIST } from '../fixtures'
import { weaponsColumns, weaponsFilters } from './weapons-columns'

const meta = {
  title: 'Content/Weapons/WeaponsColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={weaponsColumns(STORY_CAMPAIGN_ID)}
      data={[...WEAPONS_LIST]}
      filters={weaponsFilters}
      caption="Weapons available in this campaign"
    />
  ),
}
