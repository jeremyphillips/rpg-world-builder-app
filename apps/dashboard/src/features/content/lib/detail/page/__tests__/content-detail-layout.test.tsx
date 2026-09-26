import { useContext, type ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { PageChromeActionsContext } from '@/components/layout/page-chrome/page-chrome-actions-context'
import { PageChromeActionsProvider } from '@/components/layout/page-chrome/page-chrome-actions-provider'

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(),
}))

import { useCanManageCampaign } from '@/features/campaign'

import { ContentDetailLayout } from '../content-detail-layout'

const useCanManageCampaignMock = vi.mocked(useCanManageCampaign)

function PageChromeActionsProbe() {
  const actions = useContext(PageChromeActionsContext)?.actions
  return <div data-testid="page-chrome-actions">{actions}</div>
}

function renderLayout(ui: ReactElement) {
  return render(
    <MemoryRouter>
      <PageChromeActionsProvider>
        <PageChromeActionsProbe />
        {ui}
      </PageChromeActionsProvider>
    </MemoryRouter>,
  )
}

const defaultProps = {
  contentTypeKey: 'classes' as const,
  name: 'Fighter',
  displayImage: { src: '/img.png', sourceKind: 'upload' as const },
  imageName: 'Fighter',
  campaignId: 'c1',
  editHref: '/campaigns/c1/classes/f1/edit',
}

describe('ContentDetailLayout', () => {
  it('registers Edit in page chrome when the user can manage and editHref is set', () => {
    useCanManageCampaignMock.mockReturnValue(true)

    renderLayout(
      <ContentDetailLayout {...defaultProps}>
        <p>Body</p>
      </ContentDetailLayout>,
    )

    const chrome = screen.getByTestId('page-chrome-actions')
    expect(chrome.querySelector('a[href="/campaigns/c1/classes/f1/edit"]')).toHaveTextContent(
      'Edit',
    )
  })

  it('hides Edit when the user cannot manage the campaign', () => {
    useCanManageCampaignMock.mockReturnValue(false)

    renderLayout(
      <ContentDetailLayout {...defaultProps}>
        <p>Body</p>
      </ContentDetailLayout>,
    )

    expect(screen.getByTestId('page-chrome-actions')).toBeEmptyDOMElement()
  })

  it('renders the classification eyebrow, hero heading, clamped description, image, stat rows, and narrow body column', () => {
    useCanManageCampaignMock.mockReturnValue(false)

    const { container } = renderLayout(
      <ContentDetailLayout
        {...defaultProps}
        editHref={undefined}
        statRows={[{ label: 'Hit Die', value: 'd10 per level' }]}
        descriptionHtml="<p>Lead description</p>"
        descriptionContent={<p>Body-only block</p>}
      >
        <p>Extra section</p>
      </ContentDetailLayout>,
    )

    expect(screen.getByText('Class')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Fighter' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Fighter' })).toHaveAttribute('src', '/img.png')
    expect(screen.getByText('Hit Die')).toBeInTheDocument()
    expect(screen.getByText('d10 per level')).toBeInTheDocument()
    expect(screen.getByText('Lead description')).toBeInTheDocument()
    expect(screen.getByText('Body-only block')).toBeInTheDocument()
    expect(screen.getByText('Extra section')).toBeInTheDocument()

    const bodyColumn = container.querySelector('.max-w-narrow-content')
    expect(bodyColumn).not.toBeNull()
    expect(bodyColumn).toContainElement(screen.getByText('Body-only block'))
    expect(bodyColumn).toContainElement(screen.getByText('Extra section'))
  })

  it('prefers metadata over statRows when both are provided', () => {
    useCanManageCampaignMock.mockReturnValue(false)

    renderLayout(
      <ContentDetailLayout
        {...defaultProps}
        editHref={undefined}
        statRows={[{ label: 'Ignored', value: 'row' }]}
        metadata={<p>Custom metadata</p>}
      />,
    )

    expect(screen.getByText('Custom metadata')).toBeInTheDocument()
    expect(screen.queryByText('Ignored')).not.toBeInTheDocument()
  })

  it('renders an optional name badge beside the hero heading', () => {
    useCanManageCampaignMock.mockReturnValue(false)

    renderLayout(
      <ContentDetailLayout
        {...defaultProps}
        editHref={undefined}
        nameBadge={<span>Draft badge</span>}
      />,
    )

    expect(screen.getByText('Draft badge')).toBeInTheDocument()
  })

  it('omits hero description when heroDescription is false', () => {
    useCanManageCampaignMock.mockReturnValue(false)

    renderLayout(
      <ContentDetailLayout
        {...defaultProps}
        contentTypeKey="spells"
        editHref={undefined}
        heroDescription={false}
        descriptionHtml="<p>Should not appear in hero</p>"
      />,
    )

    expect(screen.queryByText('Should not appear in hero')).not.toBeInTheDocument()
  })
})
