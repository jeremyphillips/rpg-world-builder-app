import type { Meta, StoryObj } from '@storybook/react-vite'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { ATHLETICS, PERCEPTION, STEALTH } from '../fixtures'
import { SkillDetailContent } from './skill-proficiency-detail'

const meta = {
  title: 'Content/SkillProficiencyDetail',
  component: SkillDetailContent,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SkillDetailContent>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <SkillDetailContent skill={ATHLETICS} campaignId={STORY_CAMPAIGN_ID} skillId={ATHLETICS.id} />
  ),
}

export const WithStealthSkill: Story = {
  render: () => (
    <SkillDetailContent skill={STEALTH} campaignId={STORY_CAMPAIGN_ID} skillId={STEALTH.id} />
  ),
}

export const NoImage: Story = {
  render: () => (
    <SkillDetailContent skill={PERCEPTION} campaignId={STORY_CAMPAIGN_ID} skillId={PERCEPTION.id} />
  ),
}
