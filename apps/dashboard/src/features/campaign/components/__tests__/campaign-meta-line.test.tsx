/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'

import { DEFAULT_GAME_MASTER_DISPLAY_STYLE } from '@rpg/contracts'

import { renderWithProviders } from '@/test/render'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { CampaignMetaLine } from '../campaign-meta-line'
import { buildCampaignMeta } from '../../lib/campaign-meta.lib'

describe('CampaignMetaLine', () => {
  it('renders facet, status dot, and count segments', () => {
    const meta = buildCampaignMeta(
      makeCampaignListItem({
        status: 'active',
        campaignRole: 'owner',
        playerMemberCount: 4,
        openPcCount: 6,
      }),
      DEFAULT_GAME_MASTER_DISPLAY_STYLE,
    )

    renderWithProviders(<CampaignMetaLine meta={meta} includeRecency={false} />)

    expect(screen.getByText(/GM/)).toBeInTheDocument()
    expect(screen.getByText(/Active/)).toBeInTheDocument()
    expect(screen.getByText(/4 players/)).toBeInTheDocument()
    expect(screen.getByText(/6 PCs/)).toBeInTheDocument()
  })
})
