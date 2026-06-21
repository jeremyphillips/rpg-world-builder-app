import type { Meta, StoryObj } from '@storybook/react-vite'

import { DETECT_MAGIC, FIRE_BOLT } from '../fixtures'
import { SpellDetailContent } from './spells-detail'

const meta = {
  title: 'Content/Spells/SpellDetail',
  component: SpellDetailContent,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof SpellDetailContent>

export default meta
type Story = StoryObj

export const Cantrip: Story = {
  render: () => <SpellDetailContent spell={FIRE_BOLT} campaignId="camp_story" />,
}

export const LeveledWithRitual: Story = {
  render: () => <SpellDetailContent spell={DETECT_MAGIC} campaignId="camp_story" />,
}
