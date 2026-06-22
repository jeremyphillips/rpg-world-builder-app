import type { Meta, StoryObj } from '@storybook/react-vite'

import { withDashboardProviders } from '../../../../../.storybook/decorators'
import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { ELF, ORC } from '../fixtures'
import { SpeciesDetailContent } from './species-detail'

const meta = {
  title: 'Content/Species/SpeciesDetail',
  component: SpeciesDetailContent,
  parameters: { layout: 'padded' },
  decorators: [withDashboardProviders],
} satisfies Meta<typeof SpeciesDetailContent>

export default meta
type Story = StoryObj

export const NoHeritageChoices: Story = {
  render: () => <SpeciesDetailContent species={ORC} campaignId={STORY_CAMPAIGN_ID} />,
}

export const WithLineageHeritageChoice: Story = {
  render: () => <SpeciesDetailContent species={ELF} campaignId={STORY_CAMPAIGN_ID} />,
}
