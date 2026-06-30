import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'
import type { VocabularyOptionWithUsage } from '@rpg/contracts'

import { vocabularyColumns } from './vocabulary-overview-columns'

const STORY_VOCABULARY_OPTIONS: VocabularyOptionWithUsage[] = [
  {
    id: 'aberration',
    label: 'Aberration',
    description: 'Alien entities.',
    source: 'system',
    status: 'active',
    usedBy: 0,
  },
  {
    id: 'humanoid',
    label: 'Humanoid',
    source: 'system',
    status: 'active',
    usedBy: 3,
  },
  {
    id: 'fey-kin',
    label: 'Fey Kin',
    source: 'campaign',
    status: 'active',
    usedBy: 1,
  },
  {
    id: 'retired-type',
    label: 'Retired Type',
    source: 'campaign',
    status: 'disabled',
    usedBy: 0,
  },
]

const meta = {
  title: 'Homebrew/Vocabulary/VocabularyOverviewColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={vocabularyColumns()}
      data={STORY_VOCABULARY_OPTIONS}
      caption="Creature type vocabulary options"
    />
  ),
}
