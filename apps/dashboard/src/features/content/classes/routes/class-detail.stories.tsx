import type { Meta, StoryObj } from '@storybook/react-vite'
import { loadSeedSkillProficiencies } from '@rpg/catalog/skill-proficiencies'

import { withDashboardProviders } from '../../../../../.storybook/decorators'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { pickClass, pickSubclassesForClass } from '../../lib/fixtures/pick'
import { FIGHTER, SUBCLASSES_FOR_FIGHTER } from '../fixtures'
import { ClassDetailContent } from './class-detail'

const SRD_SKILLS = loadSeedSkillProficiencies('srd-cc-5.2.1')

const meta = {
  title: 'Content/ClassDetail',
  component: ClassDetailContent,
  parameters: { layout: 'padded' },
  decorators: [withDashboardProviders],
} satisfies Meta<typeof ClassDetailContent>

export default meta
type Story = StoryObj

const defaultSkillProps = {
  skillProficiencies: [...SRD_SKILLS],
  organizations: [],
  skillsPending: false,
}

export const Default: Story = {
  render: () => (
    <ClassDetailContent
      characterClass={FIGHTER}
      campaignId={STORY_CAMPAIGN_ID}
      classId={FIGHTER.id}
      subclasses={SUBCLASSES_FOR_FIGHTER}
      {...defaultSkillProps}
    />
  ),
}

export const RichTextFeatures: Story = {
  render: () => {
    const barbarian = pickClass('barbarian')
    return (
      <ClassDetailContent
        characterClass={barbarian}
        campaignId={STORY_CAMPAIGN_ID}
        classId={barbarian.id}
        subclasses={pickSubclassesForClass('barbarian')}
        {...defaultSkillProps}
      />
    )
  },
}

export const BardWithSubclassFeatures: Story = {
  render: () => {
    const bard = pickClass('bard')
    return (
      <ClassDetailContent
        characterClass={bard}
        campaignId={STORY_CAMPAIGN_ID}
        classId={bard.id}
        subclasses={pickSubclassesForClass('bard')}
        {...defaultSkillProps}
      />
    )
  },
}
