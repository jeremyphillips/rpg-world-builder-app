import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { buildSeedSpellSchoolVocabulary } from '@/features/homebrew'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { SPELL_LIST } from '../fixtures'
import { spellsColumns, spellsFilters } from './spells-overview-columns'

const STORY_SPELL_SCHOOL_VOCABULARY = buildSeedSpellSchoolVocabulary()

const meta = {
  title: 'Content/Spells/SpellsOverviewColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={spellsColumns(STORY_CAMPAIGN_ID, STORY_SPELL_SCHOOL_VOCABULARY)}
      data={[...SPELL_LIST]}
      filters={spellsFilters(STORY_SPELL_SCHOOL_VOCABULARY)}
      caption="Spells available in this campaign"
    />
  ),
}
