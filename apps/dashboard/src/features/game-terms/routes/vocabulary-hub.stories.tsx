import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ResolvedVocabularyOptionSet } from '@rpg/contracts'

import { withDashboardProviders } from '../../../../.storybook/decorators'

import { VocabularyHubContent } from './vocabulary-hub'

const STORY_CAMPAIGN_ID = 'camp_1'

const mockSets: ResolvedVocabularyOptionSet[] = [
  {
    id: 'creature-types',
    options: [
      {
        id: 'aberration',
        label: 'Aberration',
        source: 'system',
        status: 'active',
        usedBy: 0,
      },
      {
        id: 'retired',
        label: 'Retired',
        source: 'campaign',
        status: 'disabled',
        usedBy: 0,
      },
    ],
  },
  {
    id: 'damage-types',
    options: [
      {
        id: 'fire',
        label: 'Fire',
        source: 'system',
        status: 'active',
        usedBy: 0,
      },
    ],
  },
]

const meta = {
  title: 'Layout/Game Terms/VocabularyHub',
  component: VocabularyHubContent,
  parameters: { layout: 'padded' },
  decorators: [withDashboardProviders],
} satisfies Meta<typeof VocabularyHubContent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { campaignId: STORY_CAMPAIGN_ID },
  render: ({ campaignId }) => {
    const queryClient = new QueryClient()
    queryClient.setQueryData(['campaigns', campaignId, 'vocabulary'], mockSets)
    return (
      <QueryClientProvider client={queryClient}>
        <VocabularyHubContent campaignId={campaignId} />
      </QueryClientProvider>
    )
  },
}
