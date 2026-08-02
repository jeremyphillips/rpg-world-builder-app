import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { buildSeedSpellSchoolVocabulary } from '@/features/vocabulary'
import { formatContentCollectionAvailabilityCaption } from '@/features/content/lib/content-type-labels'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { SPELL_LIST } from '../fixtures'
import { spellsColumns } from '../lib/spells-overview-columns'

const STORY_SPELL_SCHOOL_VOCABULARY = buildSeedSpellSchoolVocabulary()

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
      columns={spellsColumns(STORY_CAMPAIGN_ID, STORY_SPELL_SCHOOL_VOCABULARY)}
      data={[...SPELL_LIST]}
      caption={formatContentCollectionAvailabilityCaption('spells')}
    />
  ),
}
