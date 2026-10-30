import { describe, expect, it } from 'vitest'

import type { CatalogLayer, ResolvedContentCampaignAccess } from '@rpg/contracts'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { ContentEditHeadingBadges } from './content-edit-heading-badges'

function renderBadges(options: {
  catalogLayer: CatalogLayer
  status: 'draft' | 'published'
  campaignAccess?: ResolvedContentCampaignAccess
}) {
  return render(
    <ContentEditHeadingBadges
      contentType="classes"
      catalogLayer={options.catalogLayer}
      status={options.status}
      campaignAccess={options.campaignAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS}
    />,
  )
}

describe('ContentEditHeadingBadges', () => {
  it('shows Draft before source for draft homebrew', () => {
    renderBadges({ catalogLayer: 'homebrew', status: 'draft' })
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Homebrew')).toBeInTheDocument()
    expect(screen.queryByText('Inactive')).not.toBeInTheDocument()
  })

  it('shows Inactive before source when unavailable and published', () => {
    renderBadges({
      catalogLayer: 'homebrew',
      status: 'published',
      campaignAccess: {
        ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        available: false,
        effectiveAudience: 'none',
      },
    })
    expect(screen.queryByText('Draft')).not.toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
    expect(screen.getByText('Homebrew')).toBeInTheDocument()
  })

  it('shows only the source badge when available', () => {
    renderBadges({ catalogLayer: 'system', status: 'published' })
    expect(screen.getByText('System')).toBeInTheDocument()
    expect(screen.queryByText('Draft')).not.toBeInTheDocument()
    expect(screen.queryByText('Inactive')).not.toBeInTheDocument()
  })

  itAxe('has no axe violations', async () => {
    const { container } = renderBadges({ catalogLayer: 'homebrew', status: 'draft' })
    await expectNoAxeViolations(container)
  })
})
