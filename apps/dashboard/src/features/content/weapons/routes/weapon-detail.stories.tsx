import type { Meta, StoryObj } from '@storybook/react-vite'

import { withDashboardProviders } from '../../../../../.storybook/decorators'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { LONGSWORD, SHORTBOW } from '../fixtures'
import { WeaponDetailContent } from './weapon-detail'

const meta = {
  title: 'Content/Weapons/WeaponDetail',
  component: WeaponDetailContent,
  parameters: { layout: 'padded' },
  decorators: [withDashboardProviders],
} satisfies Meta<typeof WeaponDetailContent>

export default meta
type Story = StoryObj

export const MeleeWeapon: Story = {
  render: () => <WeaponDetailContent item={LONGSWORD} campaignId={STORY_CAMPAIGN_ID} />,
}

export const RangedWeapon: Story = {
  render: () => <WeaponDetailContent item={SHORTBOW} campaignId={STORY_CAMPAIGN_ID} />,
}
