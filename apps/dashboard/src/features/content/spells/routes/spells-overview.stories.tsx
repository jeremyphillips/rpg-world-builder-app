import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { SPELL_LIST } from '../fixtures'
import { spellsColumns, spellsFilters } from '../lib/spells-overview-columns'

const meta = {
  title: 'Content/Spells/SpellsOverview',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Table: Story = {
  render: () => (
    <DataTable
      columns={spellsColumns(STORY_CAMPAIGN_ID)}
      data={[...SPELL_LIST]}
      filters={spellsFilters}
      caption="Spells available in this campaign"
    />
  ),
}
