import type { Meta, StoryObj } from '@storybook/react-vite'
import { loadSeedSkillProficiencies } from '@rpg/catalog/skill-proficiencies'

import { withDashboardProviders } from '../../../../../../.storybook/decorators'
import { STORY_CAMPAIGN_ID } from '../../../lib/fixtures/constants'
import { getContentImageUrl } from '../../../lib/detail/page/content-image-url'
import { pickSubclassesForClass } from '../../../lib/fixtures/pick'
import { FIGHTER } from '../../fixtures'
import { buildClassDetailViewModel } from '../../lib/class-display'
import { ClassDetailBody } from './class-detail-body'

const SRD_SKILLS = loadSeedSkillProficiencies('srd-cc-5.2.1')

const vocabulary = {
  resolveToolLabel: (slug: string) => slug,
}

const meta = {
  title: 'Content/ClassDetailBody',
  component: ClassDetailBody,
  parameters: { layout: 'padded' },
  decorators: [withDashboardProviders],
} satisfies Meta<typeof ClassDetailBody>

export default meta
type Story = StoryObj<typeof meta>

export const Fighter: Story = {
  args: {
    name: FIGHTER.name,
    imageUrl: getContentImageUrl(),
    imageName: FIGHTER.name,
    viewModel: buildClassDetailViewModel(FIGHTER, vocabulary, { surface: 'content-detail' }),
    subclasses: pickSubclassesForClass('fighter'),
    subclassingEnabled: true,
    campaignId: STORY_CAMPAIGN_ID,
    skillProficiencies: [...SRD_SKILLS],
    skillsPending: false,
    vocabulary,
  },
}
