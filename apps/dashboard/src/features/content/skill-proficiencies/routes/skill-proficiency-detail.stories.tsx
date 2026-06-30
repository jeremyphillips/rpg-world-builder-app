import type { Decorator, Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { classesQueryKey } from '../../classes/hooks/use-classes'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { pickClass } from '../../lib/fixtures/pick'
import { ATHLETICS, PERCEPTION, STEALTH } from '../fixtures'
import { SkillDetailContent } from './skill-proficiency-detail'

function catalogClassesForStories() {
  const slugs = new Set<string>()
  for (const skill of [ATHLETICS, STEALTH, PERCEPTION]) {
    skill.suggestedClasses?.forEach((slug) => slugs.add(slug))
  }
  return [...slugs].map((slug) => pickClass(slug))
}

const withSkillDetailProviders: Decorator = (Story) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  queryClient.setQueryData(classesQueryKey(STORY_CAMPAIGN_ID), catalogClassesForStories())
  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  )
}

const meta = {
  title: 'Content/SkillProficiencyDetail',
  component: SkillDetailContent,
  parameters: { layout: 'padded' },
  decorators: [withSkillDetailProviders],
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
