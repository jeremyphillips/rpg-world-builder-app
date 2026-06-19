import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { SPECIES_LIST } from '../fixtures'
import { speciesColumns, speciesFilters } from './species-columns'

const meta = {
  title: 'Content/Species/SpeciesColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={speciesColumns(STORY_CAMPAIGN_ID)}
      data={[...SPECIES_LIST]}
      filters={speciesFilters}
      caption="Playable species available in this campaign"
    />
  ),
}
