import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { Route, Routes } from 'react-router-dom'

import { renderWithProviders } from '@/test/render'

import { GLOBAL_SEARCH_COPY } from '../lib/global-search-copy'

vi.mock('../hooks/use-global-search-page', () => ({
  useGlobalSearchPage: () => ({
    query: '',
    group: 'all',
    hasQuery: false,
    filterOptions: [
      { value: 'all', label: 'All' },
      { value: 'content', label: 'Content' },
    ],
    flatResults: [],
    groupedSections: null,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
    setQuery: vi.fn(),
    setGroup: vi.fn(),
  }),
}))

import { GlobalSearchPage } from './global-search-page'

function renderPage(initialEntry = '/campaigns/campaign-1/search') {
  return renderWithProviders(
    <Routes>
      <Route path="/campaigns/:campaignId/search" element={<GlobalSearchPage />} />
    </Routes>,
    { initialEntries: [initialEntry] },
  )
}

describe('GlobalSearchPage', () => {
  it('shows the empty-query prompt instead of listing the catalog', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { name: GLOBAL_SEARCH_COPY.pageTitle, level: 1 }),
    ).toBeInTheDocument()
    expect(screen.getByText(GLOBAL_SEARCH_COPY.emptyQueryTitle)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Fireball/i })).not.toBeInTheDocument()
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderPage()

    await expectNoAxeViolations(container)
  })
})
