import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ResolvedVocabularyOptionSet } from '@rpg/contracts'

import { withDashboardProviders } from '../../../../.storybook/decorators'

import { VocabularyDetailContent } from './vocabulary-detail-content'

const STORY_CAMPAIGN_ID = 'camp_1'

const mockSet: ResolvedVocabularyOptionSet = {
  id: 'creature-types',
  options: [
    {
      id: 'aberration',
      label: 'Aberration',
      description: 'Alien entities.',
      source: 'system',
      status: 'active',
      usedBy: 0,
    },
    {
      id: 'fey-kin',
      label: 'Fey Kin',
      source: 'campaign',
      status: 'active',
      usedBy: 1,
    },
  ],
}

const meta = {
  title: 'Layout/Homebrew/VocabularyDetail',
  component: VocabularyDetailContent,
  parameters: { layout: 'padded' },
  decorators: [
    withDashboardProviders,
    (Story) => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
      queryClient.setQueryData(
        ['campaigns', STORY_CAMPAIGN_ID, 'vocabulary', 'creature-types'],
        mockSet,
      )
      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      )
    },
  ],
} satisfies Meta<typeof VocabularyDetailContent>

export default meta
type Story = StoryObj

export const CreatureTypes: Story = {
  render: () => <VocabularyDetailContent campaignId={STORY_CAMPAIGN_ID} setId="creature-types" />,
}

export const NotImplemented: Story = {
  render: () => <VocabularyDetailContent campaignId={STORY_CAMPAIGN_ID} setId="damage-types" />,
}
