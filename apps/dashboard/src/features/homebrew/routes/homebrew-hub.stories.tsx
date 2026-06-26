import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

import { withDashboardProviders } from '../../../../.storybook/decorators'

const STORY_CAMPAIGN_ID = 'camp_1'
import type { HomebrewContentSummary } from '@rpg/contracts'

import { HomebrewHubContent } from './homebrew-hub'

const mockSummary: HomebrewContentSummary = {
  content: [
    { contentType: 'classes', totalCount: 12 },
    { contentType: 'spells', totalCount: 340 },
    { contentType: 'species', totalCount: 9 },
    { contentType: 'feats', totalCount: 42 },
    { contentType: 'equipment', totalCount: 180 },
    { contentType: 'skill-proficiencies', totalCount: 18 },
  ],
}

function withHomebrewSummary(): Meta<typeof HomebrewHubContent>['decorators'] {
  return [
    withDashboardProviders,
    (Story) => {
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
      queryClient.setQueryData(['campaigns', STORY_CAMPAIGN_ID, 'homebrew', 'summary'], mockSummary)
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      )
    },
  ]
}

const meta = {
  title: 'Layout/Homebrew/HomebrewHub',
  component: HomebrewHubContent,
  parameters: { layout: 'padded' },
  decorators: withHomebrewSummary(),
} satisfies Meta<typeof HomebrewHubContent>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => <HomebrewHubContent campaignId={STORY_CAMPAIGN_ID} />,
}
