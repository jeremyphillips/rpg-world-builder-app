import { Text } from '@rpg/ui'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@/features/campaign', () => ({
  useCanManageCampaign: vi.fn(),
}))

import { useCanManageCampaign } from '@/features/campaign'

import { ContentOverviewShell } from './content-overview-shell'

const useCanManageCampaignMock = vi.mocked(useCanManageCampaign)

function renderShell(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ContentOverviewShell', () => {
  beforeEach(() => {
    useCanManageCampaignMock.mockReturnValue(false)
  })

  it('renders the loading state', () => {
    renderShell(
      <ContentOverviewShell heading="Equipment" campaignId="c1" isPending={true} isError={false}>
        <Text>Ready content</Text>
      </ContentOverviewShell>,
    )
    expect(screen.getByRole('heading', { name: 'Equipment' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Loading' }).parentElement).toHaveClass(
      'flex',
      'justify-center',
    )
    expect(screen.queryByText('Ready content')).not.toBeInTheDocument()
  })

  it('renders the error state with role="alert"', () => {
    renderShell(
      <ContentOverviewShell heading="Equipment" campaignId="c1" isPending={false} isError={true}>
        <Text>Ready content</Text>
      </ContentOverviewShell>,
    )
    expect(screen.getByRole('heading', { name: 'Equipment' })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load equipment.')
    expect(screen.queryByText('Ready content')).not.toBeInTheDocument()
  })

  it('renders a custom error label', () => {
    renderShell(
      <ContentOverviewShell
        heading="Equipment"
        campaignId="c1"
        isPending={false}
        isError={true}
        errorLabel="Something went wrong."
      >
        <Text>Ready content</Text>
      </ContentOverviewShell>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.')
  })

  it('renders the ready state with children', () => {
    renderShell(
      <ContentOverviewShell heading="Equipment" campaignId="c1" isPending={false} isError={false}>
        <Text>Ready content</Text>
      </ContentOverviewShell>,
    )
    expect(screen.getByRole('heading', { name: 'Equipment' })).toBeInTheDocument()
    expect(screen.getByText('Ready content')).toBeInTheDocument()
  })

  it('shows New when the user can manage the campaign', () => {
    useCanManageCampaignMock.mockReturnValue(true)

    renderShell(
      <ContentOverviewShell
        heading="Equipment"
        campaignId="c1"
        isPending={false}
        isError={false}
        newHref="/campaigns/c1/equipment/new"
        newLabel="New Equipment"
      >
        <Text>Ready content</Text>
      </ContentOverviewShell>,
    )

    expect(screen.getByRole('link', { name: 'New Equipment' })).toHaveAttribute(
      'href',
      '/campaigns/c1/equipment/new',
    )
  })

  it('hides New when the user cannot manage the campaign', () => {
    renderShell(
      <ContentOverviewShell
        heading="Equipment"
        campaignId="c1"
        isPending={false}
        isError={false}
        newHref="/campaigns/c1/equipment/new"
        newLabel="New Equipment"
      >
        <Text>Ready content</Text>
      </ContentOverviewShell>,
    )

    expect(screen.queryByRole('link', { name: 'New Equipment' })).not.toBeInTheDocument()
  })
})
