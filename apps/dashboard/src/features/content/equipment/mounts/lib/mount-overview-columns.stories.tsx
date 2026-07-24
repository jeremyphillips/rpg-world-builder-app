import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { MOUNT_LIST } from '../fixtures'
import { mountColumns } from './mount-overview-columns'

const meta = {
  title: 'Content/Equipment/Mounts/MountOverviewColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={mountColumns(STORY_CAMPAIGN_ID)}
      data={[...MOUNT_LIST]}
      caption="Mounts available in this campaign"
    />
  ),
}
