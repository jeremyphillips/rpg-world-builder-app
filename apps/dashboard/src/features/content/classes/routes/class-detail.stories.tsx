import type { Meta, StoryObj } from '@storybook/react-vite'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { pickClass, pickSubclassesForClass } from '../../lib/fixtures/pick'
import { FIGHTER, SUBCLASSES_FOR_FIGHTER } from '../fixtures'
import { ClassDetailContent } from './class-detail'

const meta = {
  title: 'Content/ClassDetail',
  component: ClassDetailContent,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ClassDetailContent>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <ClassDetailContent
      characterClass={FIGHTER}
      campaignId={STORY_CAMPAIGN_ID}
      classId={FIGHTER.id}
      subclasses={SUBCLASSES_FOR_FIGHTER}
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
      />
    )
  },
}
