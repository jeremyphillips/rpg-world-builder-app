import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(),
}))

import { useCanManageCampaign } from '@/features/campaign'

import { ContentDetailLayout } from './content-detail-layout'

const useCanManageCampaignMock = vi.mocked(useCanManageCampaign)

describe('ContentDetailLayout edit gating', () => {
  it('renders Edit when the user can manage and editHref is set', () => {
    useCanManageCampaignMock.mockReturnValue(true)

    render(
      <MemoryRouter>
        <ContentDetailLayout
          imageUrl="/img.png"
          imageName="Fighter"
          campaignId="c1"
          editHref="/campaigns/c1/classes/f1/edit"
        >
          <p>Body</p>
        </ContentDetailLayout>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/campaigns/c1/classes/f1/edit',
    )
  })

  it('hides Edit when the user cannot manage the campaign', () => {
    useCanManageCampaignMock.mockReturnValue(false)

    render(
      <MemoryRouter>
        <ContentDetailLayout
          imageUrl="/img.png"
          imageName="Fighter"
          campaignId="c1"
          editHref="/campaigns/c1/classes/f1/edit"
        >
          <p>Body</p>
        </ContentDetailLayout>
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument()
  })
})
