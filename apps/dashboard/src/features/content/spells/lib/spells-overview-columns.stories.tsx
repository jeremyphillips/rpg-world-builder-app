import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { buildSeedSpellSchoolVocabulary } from '@/features/vocabulary'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { SPELL_LIST } from '../fixtures'
import { spellsColumns } from './spells-overview-columns'

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
      caption="Spells available in this campaign"
    />
  ),
}
