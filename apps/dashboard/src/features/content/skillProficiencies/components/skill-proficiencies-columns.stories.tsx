import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { SKILLS_LIST } from '../fixtures'
import { skillProficienciesColumns, skillProficienciesFilters } from './skill-proficiencies-columns'

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
      columns={skillProficienciesColumns(STORY_CAMPAIGN_ID)}
      data={[...SKILLS_LIST]}
      filters={skillProficienciesFilters}
      caption="Skill proficiencies available in this campaign"
    />
  ),
}
