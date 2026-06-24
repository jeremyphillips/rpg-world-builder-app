import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { TOOL_LIST } from '../fixtures'
import { toolColumns, toolFilters } from './tool-columns'

const meta = {
  title: 'Content/Equipment/Tools/ToolColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={toolColumns(STORY_CAMPAIGN_ID)}
      data={[...TOOL_LIST]}
      filters={toolFilters}
      caption="Tools available in this campaign"
    />
  ),
}
