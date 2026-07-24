import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { WEAPON_LIST } from '../fixtures'
import { weaponColumns } from './weapon-overview-columns'

const meta = {
  title: 'Content/Equipment/Weapons/WeaponOverviewColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={weaponColumns(STORY_CAMPAIGN_ID)}
      data={[...WEAPON_LIST]}
      caption="Weapons available in this campaign"
    />
  ),
}
