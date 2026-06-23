import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { FEAT_LIST } from '../fixtures'
import { featsColumns, featsFilters } from './feats-columns'

const meta = {
  title: 'Content/Feats/FeatsColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={featsColumns(STORY_CAMPAIGN_ID)}
      data={[...FEAT_LIST]}
      filters={featsFilters}
      caption="Feats available in this campaign"
    />
  ),
}
