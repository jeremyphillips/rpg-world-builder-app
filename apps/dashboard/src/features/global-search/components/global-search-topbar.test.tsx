import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { renderWithProviders } from '@/test/render'

import { GlobalSearchProvider } from './global-search-provider.client'
import { GlobalSearchTopbar } from './global-search-topbar.client'
import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'

const navigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => navigate,
  }
})

vi.mock('../hooks/use-global-search-catalog', () => ({
  useGlobalSearchCatalog: () => ({
    data: { documents: [], scope: { kind: 'campaign', campaignId: 'campaign-1' } },
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

vi.mock('@/features/campaign', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/campaign')>()
  return {
    ...actual,
    useActiveCampaignId: () => 'campaign-1',
  }
})

function renderTopbar() {
  return renderWithProviders(
    <GlobalSearchProvider>
      <GlobalSearchTopbar />
    </GlobalSearchProvider>,
    { initialEntries: ['/campaigns/campaign-1'] },
  )
}

describe('GlobalSearchTopbar', () => {
  it('expands into a search input when the trigger is clicked', async () => {
    const user = userEvent.setup()
    renderTopbar()

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: GLOBAL_SEARCH_COPY.triggerLabel }))

    expect(
      screen.getByRole('searchbox', { name: GLOBAL_SEARCH_COPY.searchFieldLabel }),
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: GLOBAL_SEARCH_COPY.pageTitle })).toBeInTheDocument()
  })

  it('submits to the full search page when Enter is pressed', async () => {
    const user = userEvent.setup()
    navigate.mockClear()
    renderTopbar()

    await user.click(screen.getByRole('button', { name: GLOBAL_SEARCH_COPY.triggerLabel }))
    await user.type(
      screen.getByRole('searchbox', { name: GLOBAL_SEARCH_COPY.searchFieldLabel }),
      'fireball{Enter}',
    )

    expect(navigate).toHaveBeenCalledWith('/campaigns/campaign-1/search?q=fireball')
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })

  it('has no axe accessibility violations when collapsed', async () => {
    const { container } = renderTopbar()

    await expectNoAxeViolations(container)
  })
})
