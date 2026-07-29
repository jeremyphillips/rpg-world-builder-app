import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { STORY_CAMPAIGN_ID } from '../../lib/fixtures/constants'
import { CITY_COUNCIL, SILVER_CIRCLE } from '../fixtures'
import { organizationConnectedCharactersQueryKey } from '../hooks/use-organization-connected-characters'
import { OrganizationDetailContent } from './organization-detail'

const meta = {
  title: 'Content/Organizations/OrganizationDetail',
  component: OrganizationDetailContent,
  parameters: { layout: 'padded' },
  decorators: [
    (Story, context) => {
      const organization = context.args.organization ?? CITY_COUNCIL
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
      queryClient.setQueryData(
        organizationConnectedCharactersQueryKey(STORY_CAMPAIGN_ID, organization.id),
        {
          items: [
            {
              characterType: 'npc',
              character: {
                id: 'npc-story-1',
                name: 'Circle Envoy',
                summary: 'Human · Level 3 Rogue',
              },
            },
          ],
          total: 1,
        },
      )

      return (
        <QueryClientProvider client={queryClient}>
          <Story />
        </QueryClientProvider>
      )
    },
  ],
} satisfies Meta<typeof OrganizationDetailContent>

export default meta
type Story = StoryObj<typeof meta>

export const Government: Story = {
  args: { organization: CITY_COUNCIL, campaignId: STORY_CAMPAIGN_ID },
}

export const Academic: Story = {
  args: { organization: SILVER_CIRCLE, campaignId: STORY_CAMPAIGN_ID },
}
