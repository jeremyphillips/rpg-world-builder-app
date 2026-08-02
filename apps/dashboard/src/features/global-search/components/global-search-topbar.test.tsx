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
    <div>
      <button type="button">Outside</button>
      <GlobalSearchProvider>
        <GlobalSearchTopbar />
      </GlobalSearchProvider>
    </div>,
    { initialEntries: ['/campaigns/campaign-1'] },
  )
}

async function openTopbar(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: GLOBAL_SEARCH_COPY.triggerLabel }))
  return screen.getByRole('searchbox', { name: GLOBAL_SEARCH_COPY.searchFieldLabel })
}

describe('GlobalSearchTopbar', () => {
  it('expands into a search input when the trigger is clicked', async () => {
    const user = userEvent.setup()
    renderTopbar()

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()

    await openTopbar(user)

    expect(screen.getByRole('region', { name: GLOBAL_SEARCH_COPY.pageTitle })).toBeInTheDocument()
  })

  it('submits to the full search page when Enter is pressed', async () => {
    const user = userEvent.setup()
    navigate.mockClear()
    renderTopbar()

    await openTopbar(user)
    await user.type(
      screen.getByRole('searchbox', { name: GLOBAL_SEARCH_COPY.searchFieldLabel }),
      'fireball{Enter}',
    )

    expect(navigate).toHaveBeenCalledWith('/campaigns/campaign-1/search?q=fireball')
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
  })

  it('closes on Escape and restores focus to the trigger', async () => {
    const user = userEvent.setup()
    renderTopbar()

    await openTopbar(user)
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: GLOBAL_SEARCH_COPY.triggerLabel })).toHaveFocus()
  })

  it('closes on outside click without stealing focus from the clicked target', async () => {
    const user = userEvent.setup()
    renderTopbar()

    await openTopbar(user)
    const outside = screen.getByRole('button', { name: 'Outside' })
    await user.click(outside)

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    expect(outside).toHaveFocus()
  })

  it('has no axe accessibility violations when collapsed', async () => {
    const { container } = renderTopbar()

    await expectNoAxeViolations(container)
  })
})
