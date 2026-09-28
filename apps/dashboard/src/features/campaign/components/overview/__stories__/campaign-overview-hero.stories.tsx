import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createUploadRoleAssignment } from '@rpg/contracts'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { CampaignOverviewHero } from '../campaign-overview-hero'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

const meta = {
  title: 'Campaign/CampaignOverviewHero',
  component: CampaignOverviewHero,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div className="w-full min-w-0">
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  args: {
    campaignId: 'camp_1',
    canManage: true,
  },
} satisfies Meta<typeof CampaignOverviewHero>

export default meta
type Story = StoryObj<typeof CampaignOverviewHero>

const bannerImageId = 'img-banner'
const emblemImageId = 'img-emblem'

export const WithBannerAndEmblem: Story = {
  args: {
    campaign: makeCampaignListItem({
      identity: {
        name: 'Ruins of the Shattered Crown',
        media: {
          revision: 1,
          images: [
            { id: bannerImageId, assetId: 'asset-banner', alt: 'Campaign banner' },
            { id: emblemImageId, assetId: 'asset-emblem', alt: 'Campaign emblem' },
          ],
          roles: {
            banner: createUploadRoleAssignment(bannerImageId),
            emblem: createUploadRoleAssignment(emblemImageId),
          },
        },
      },
      playerMemberCount: 4,
      openPcCount: 6,
      configuration: {
        flavor: {
          playStyle: ['dungeon_crawl'],
          mood: ['heroic'],
          magicLevel: 'standard_fantasy',
          difficulty: 'dangerous',
        },
      },
    }),
  },
}

export const WithoutMedia: Story = {
  args: {
    campaign: makeCampaignListItem({
      status: 'draft',
      identity: { name: 'New Campaign' },
      playerMemberCount: 1,
      openPcCount: 1,
      configuration: {
        flavor: {
          playStyle: ['sandbox'],
        },
      },
    }),
    canManage: false,
  },
}

export const PlayerViewer: Story = {
  args: {
    campaign: makeCampaignListItem({
      identity: { name: 'Joined Campaign' },
      campaignRole: 'pc',
      playerMemberCount: 3,
      openPcCount: 5,
    }),
    canManage: false,
  },
}

export const OverflowFlavorBadges: Story = {
  args: {
    campaign: makeCampaignListItem({
      identity: { name: 'Fully Tagged Campaign' },
      playerMemberCount: 2,
      openPcCount: 2,
      configuration: {
        flavor: {
          playStyle: ['dungeon_crawl', 'exploration', 'sandbox'],
          mood: ['heroic', 'dark_fantasy', 'gritty'],
          magicLevel: 'standard_fantasy',
          difficulty: 'dangerous',
        },
      },
    }),
  },
}
