import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataTable } from '@rpg/ui'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { SKILLS_LIST } from '../fixtures'
import { skillProficienciesColumns } from './skill-proficiencies-overview-columns'

const meta = {
  title: 'Content/SkillProficiencies/SkillProficienciesOverviewColumns',
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
      caption="Skill proficiencies available in this campaign"
    />
  ),
}
