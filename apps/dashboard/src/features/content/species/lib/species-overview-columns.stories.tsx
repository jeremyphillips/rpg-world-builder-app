import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { buildSeedCreatureTypeVocabulary } from '@/features/homebrew'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { SPECIES_LIST } from '../fixtures'
import { speciesColumns } from './species-overview-columns'

const storyVocabulary = buildSeedCreatureTypeVocabulary()

const meta = {
  title: 'Content/Species/SpeciesOverviewColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={speciesColumns(STORY_CAMPAIGN_ID, storyVocabulary)}
      data={[...SPECIES_LIST]}
      caption="Playable species available in this campaign"
    />
  ),
}
