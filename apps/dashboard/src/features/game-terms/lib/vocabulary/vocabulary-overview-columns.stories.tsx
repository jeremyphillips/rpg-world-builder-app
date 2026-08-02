import type { Meta, StoryObj } from '@storybook/react-vite'
import type { VocabularyOptionWithUsage } from '@rpg/contracts'

import { CatalogOverviewTable } from '@/lib/data-table/catalog-overview-table.client'

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
    usedBySummary: [
      { kind: 'content', contentTypeKey: 'species', id: '1', label: 'Elf', slug: 'elf' },
      { kind: 'content', contentTypeKey: 'species', id: '2', label: 'Human', slug: 'human' },
      { kind: 'content', contentTypeKey: 'species', id: '3', label: 'Orc', slug: 'orc' },
    ],
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
  component: CatalogOverviewTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CatalogOverviewTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <CatalogOverviewTable
      tableKey="vocabulary-creature-types"
      columns={vocabularyColumns({
        usageSummaryLabels: { singular: 'species', plural: 'species' },
      })}
      data={STORY_VOCABULARY_OPTIONS}
      caption="Creature type vocabulary options"
    />
  ),
}
