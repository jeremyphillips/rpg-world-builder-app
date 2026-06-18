import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Species } from '@rpg/contracts'
import { DataTable } from '@rpg/ui'

import { speciesColumns, speciesFilters } from './species-columns'

const CAMPAIGN_ID = 'camp_1'

const SAMPLE_SPECIES: Species[] = [
  {
    id: 'srd-cc-5.2.1:elf',
    slug: 'elf',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    name: 'Elf',
    creatureType: 'humanoid',
    sizes: ['medium'],
    speed: { walk: 30 },
    traits: [
      {
        id: 'darkvision',
        name: 'Darkvision',
        description: '<p>You have Darkvision with a range of 60 feet.</p>',
        grants: { senses: [{ type: 'darkvision', range: 60 }] },
      },
      {
        id: 'fey-ancestry',
        name: 'Fey Ancestry',
        description: '<p>Advantage on Charmed saves.</p>',
      },
      { id: 'trance', name: 'Trance', description: '<p>No need to sleep; 4-hour Long Rest.</p>' },
    ],
    choiceGroups: [
      {
        id: 'elven-lineage',
        name: 'Elven Lineage',
        kind: 'lineage',
        options: [
          { id: 'drow', name: 'Drow', grants: { senses: [{ type: 'darkvision', range: 120 }] } },
          { id: 'high-elf', name: 'High Elf' },
          { id: 'wood-elf', name: 'Wood Elf', grants: { speedOverride: { walk: 35 } } },
        ],
      },
    ],
  },
  {
    id: 'srd-cc-5.2.1:orc',
    slug: 'orc',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    name: 'Orc',
    creatureType: 'humanoid',
    sizes: ['medium'],
    speed: { walk: 30 },
    traits: [
      {
        id: 'adrenaline-rush',
        name: 'Adrenaline Rush',
        description: '<p>Dash as Bonus Action.</p>',
      },
      {
        id: 'darkvision',
        name: 'Darkvision',
        description: '<p>You have Darkvision with a range of 120 feet.</p>',
        grants: { senses: [{ type: 'darkvision', range: 120 }] },
      },
      {
        id: 'relentless-endurance',
        name: 'Relentless Endurance',
        description: '<p>Drop to 1 HP instead of 0.</p>',
      },
    ],
  },
  {
    id: 'srd-cc-5.2.1:human',
    slug: 'human',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    name: 'Human',
    creatureType: 'humanoid',
    sizes: ['medium', 'small'],
    speed: { walk: 30 },
    traits: [
      {
        id: 'resourceful',
        name: 'Resourceful',
        description: '<p>Gain Heroic Inspiration on Long Rest.</p>',
      },
      {
        id: 'skillful',
        name: 'Skillful',
        description: '<p>Proficiency in one skill of your choice.</p>',
      },
      {
        id: 'versatile',
        name: 'Versatile',
        description: '<p>Gain an Origin feat of your choice.</p>',
      },
    ],
  },
]

const meta = {
  title: 'Content/Species/SpeciesColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <DataTable
      columns={speciesColumns(CAMPAIGN_ID)}
      data={SAMPLE_SPECIES}
      filters={speciesFilters}
      caption="Playable species available in this campaign"
    />
  ),
}
