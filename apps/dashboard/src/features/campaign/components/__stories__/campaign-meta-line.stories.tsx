import type { Meta, StoryObj } from '@storybook/react-vite'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'
import { resolveCampaignGameMasterDisplayStyle } from '../../lib/campaign-display'
import { buildCampaignMeta } from '../../lib/campaign-meta.lib'
import { CampaignMetaLine } from '../campaign-meta-line'

const meta = {
  title: 'Campaign/CampaignMetaLine',
  component: CampaignMetaLine,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof CampaignMetaLine>

export default meta
type Story = StoryObj<typeof CampaignMetaLine>

const gameMasterStyle = resolveCampaignGameMasterDisplayStyle()

export const ManagerWithPcDelta: Story = {
  args: {
    includeRecency: true,
    meta: buildCampaignMeta(
      makeCampaignListItem({
        status: 'active',
        campaignRole: 'owner',
        playerMemberCount: 4,
        openPcCount: 6,
        lastOpenedByViewerAt: '2026-09-27T12:00:00.000Z',
      }),
      gameMasterStyle,
    ),
  },
}

export const PlayerNoRecency: Story = {
  args: {
    includeRecency: false,
    meta: buildCampaignMeta(
      makeCampaignListItem({
        campaignRole: 'pc',
        playerMemberCount: 1,
        openPcCount: 2,
      }),
      gameMasterStyle,
    ),
  },
}
