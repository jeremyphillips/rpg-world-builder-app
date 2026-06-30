import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(),
}))

import { useCanManageCampaign } from '@/features/campaign'

import { ContentDetailLayout } from './content-detail-layout'

const useCanManageCampaignMock = vi.mocked(useCanManageCampaign)

const defaultProps = {
  name: 'Fighter',
  imageUrl: '/img.png',
  imageName: 'Fighter',
  campaignId: 'c1',
  editHref: '/campaigns/c1/classes/f1/edit',
}

describe('ContentDetailLayout', () => {
  it('renders Edit when the user can manage and editHref is set', () => {
    useCanManageCampaignMock.mockReturnValue(true)

    render(
      <MemoryRouter>
        <ContentDetailLayout {...defaultProps}>
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
        <ContentDetailLayout {...defaultProps}>
          <p>Body</p>
        </ContentDetailLayout>
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('renders the hero heading, image, stat rows, and narrow body column', () => {
    useCanManageCampaignMock.mockReturnValue(false)

    const { container } = render(
      <MemoryRouter>
        <ContentDetailLayout
          {...defaultProps}
          editHref={undefined}
          statRows={[{ label: 'Hit Die', value: 'd10 per level' }]}
          descriptionContent={<p>Lead description</p>}
        >
          <p>Extra section</p>
        </ContentDetailLayout>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Fighter' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Fighter' })).toHaveAttribute('src', '/img.png')
    expect(screen.getByText('Hit Die')).toBeInTheDocument()
    expect(screen.getByText('d10 per level')).toBeInTheDocument()
    expect(screen.getByText('Lead description')).toBeInTheDocument()
    expect(screen.getByText('Extra section')).toBeInTheDocument()

    const bodyColumn = container.querySelector('.max-w-narrow-content')
    expect(bodyColumn).not.toBeNull()
    expect(bodyColumn).toContainElement(screen.getByText('Lead description'))
    expect(bodyColumn).toContainElement(screen.getByText('Extra section'))
  })

  it('prefers metadata over statRows when both are provided', () => {
    useCanManageCampaignMock.mockReturnValue(false)

    render(
      <MemoryRouter>
        <ContentDetailLayout
          {...defaultProps}
          editHref={undefined}
          statRows={[{ label: 'Ignored', value: 'row' }]}
          metadata={<p>Custom metadata</p>}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Custom metadata')).toBeInTheDocument()
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument()
  })
})
