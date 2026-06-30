import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { CLASS_LIST } from '../fixtures'
import { classColumns, classFilters } from './classes-overview-columns'

const meta = {
  title: 'Content/Classes/ClassesOverviewColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={classColumns(STORY_CAMPAIGN_ID)}
      data={[...CLASS_LIST]}
      filters={classFilters}
      caption="Character classes available in this campaign"
    />
  ),
}
