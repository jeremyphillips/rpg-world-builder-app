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

  it('pairs status dot and label with StatusDot spacing and InlineMetadata separators', () => {
    const meta = buildCampaignMeta(
      makeCampaignListItem({
        status: 'active',
        campaignRole: 'owner',
        playerMemberCount: 4,
        openPcCount: 6,
      }),
      DEFAULT_GAME_MASTER_DISPLAY_STYLE,
    )

    const { container } = renderWithProviders(
      <CampaignMetaLine meta={meta} includeRecency={false} />,
    )

    const statusLabel = screen.getByText('Active')
    const statusPair = statusLabel.closest('.inline-flex.items-center.gap-1\\.5')
    expect(statusPair).toBeInTheDocument()
    expect(statusPair?.querySelector('[aria-hidden="true"].rounded-full')).toBeInTheDocument()

    const separators = container.querySelectorAll('[data-inline-metadata-separator]')
    expect(separators.length).toBe(3)

    expect(container.querySelector('.text-xs')).toBeInTheDocument()
    expect(statusLabel).not.toHaveClass('text-style-caption')
  })

  it('keeps the status dot decorative when the label is visible', () => {
    const meta = buildCampaignMeta(
      makeCampaignListItem({
        status: 'draft',
        campaignRole: 'owner',
        playerMemberCount: 1,
        openPcCount: 1,
      }),
      DEFAULT_GAME_MASTER_DISPLAY_STYLE,
    )

    renderWithProviders(<CampaignMetaLine meta={meta} includeRecency={false} />)

    expect(screen.getByText('Draft')).toBeInTheDocument()
    const dot = document.querySelector('[aria-hidden="true"].rounded-full')
    expect(dot).toBeInTheDocument()
  })
})
