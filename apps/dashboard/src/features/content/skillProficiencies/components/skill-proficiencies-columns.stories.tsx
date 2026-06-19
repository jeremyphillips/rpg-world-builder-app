import type { Meta, StoryObj } from '@storybook/react-vite'
import type { SkillProficiency } from '@rpg/contracts'
import { DataTable } from '@rpg/ui'

import { skillProficienciesColumns, skillProficienciesFilters } from './skill-proficiencies-columns'

const CAMPAIGN_ID = 'camp_1'

const SAMPLE_SKILLS: SkillProficiency[] = [
  {
    id: 'srd-cc-5.2.1:athletics',
    slug: 'athletics',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    name: 'Athletics',
    description: 'Difficult situations you face while climbing, jumping, or swimming.',
    ability: 'str',
    suggestedClasses: ['barbarian', 'fighter', 'paladin'],
  },
  {
    id: 'srd-cc-5.2.1:acrobatics',
    slug: 'acrobatics',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    name: 'Acrobatics',
    description: 'Staying on your feet in tricky situations.',
    ability: 'dex',
    suggestedClasses: ['bard', 'monk', 'rogue'],
  },
  {
    id: 'srd-cc-5.2.1:arcana',
    slug: 'arcana',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    name: 'Arcana',
    description:
      'Recall lore about spells, magic items, eldritch symbols, and planes of existence.',
    ability: 'int',
    suggestedClasses: ['bard', 'sorcerer', 'warlock', 'wizard'],
  },
  {
    id: 'srd-cc-5.2.1:perception',
    slug: 'perception',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    name: 'Perception',
    description: 'Lets you spot, hear, or otherwise detect the presence of something.',
    ability: 'wis',
    suggestedClasses: ['barbarian', 'druid', 'fighter', 'ranger', 'rogue'],
  },
]

const meta = {
  title: 'Content/SkillProficiencies/SkillProficienciesColumns',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <DataTable
      columns={skillProficienciesColumns(CAMPAIGN_ID)}
      data={SAMPLE_SKILLS}
      filters={skillProficienciesFilters}
      caption="Skill proficiencies available in this campaign"
    />
  ),
}
