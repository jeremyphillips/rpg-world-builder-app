import type { Meta, StoryObj } from '@storybook/react-vite'

import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { ContentOverviewNameCell } from './content-overview-name-cell'
import { contentOverviewListQueryKey } from './content-overview-query-keys'

const managerContext = {
  campaignId: 'camp-1',
  contentTypeKey: 'classes' as const,
  queryKeyFn: (campaignId: string) => contentOverviewListQueryKey(campaignId, 'classes'),
  duplicateSource: { id: 'cls-1', name: 'Arcane Trickster', source: 'homebrew' as const },
}

const meta = {
  title: 'Content/Overview/ContentOverviewNameCell',
  component: ContentOverviewNameCell,
  parameters: { layout: 'padded' },
  args: {
    name: 'Arcane Trickster',
    status: 'published',
    campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    nameHref: '/classes/arcane-trickster',
    editHref: '/classes/arcane-trickster/edit',
    canManage: true,
    ...managerContext,
  },
} satisfies Meta<typeof ContentOverviewNameCell>

export default meta
type Story = StoryObj<typeof meta>

export const ManagerDefault: Story = {}

export const ManagerDraft: Story = {
  args: {
    status: 'draft',
  },
}

export const ManagerUnavailable: Story = {
  args: {
    campaignAccess: {
      ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      available: false,
      effectiveAudience: 'none',
      visibilityMode: 'all_players',
    },
  },
}

export const ManagerDmOnly: Story = {
  args: {
    campaignAccess: {
      ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      visibilityMode: 'dm_only',
    },
  },
}

export const ManagerSpecificPlayers: Story = {
  args: {
    campaignAccess: {
      ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      visibilityMode: 'specific_players',
      participantIds: ['pc-1', 'pc-2', 'pc-3'],
    },
  },
}

export const PlayerRow: Story = {
  args: {
    canManage: false,
    editHref: undefined,
  },
}
