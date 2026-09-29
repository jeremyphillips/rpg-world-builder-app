import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeTestQueryClient } from '@/test/render'

import { LOCATION_CREATE_TYPE_SEARCH_PARAM } from '../../lib/create/location-create-shortcuts'
import { LocationCreatePage } from './location-create-page'

vi.mock('@/features/campaign', () => ({
  useCampaigns: () => ({ data: [] }),
}))

vi.mock('../../../lib/forms/shells/create/content-create-shell', () => ({
  ContentCreateShell: ({
    heading,
    initialValues,
  }: {
    heading: string
    initialValues?: Record<string, unknown>
  }) => (
    <div
      data-testid="content-create-shell"
      data-initial-values={JSON.stringify(initialValues ?? null)}
    >
      {heading}
    </div>
  ),
}))

function renderLocationCreatePage(search: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/campaigns/:campaignId/locations/new',
        element: <LocationCreatePage campaignId="campaign-1" />,
      },
    ],
    { initialEntries: [`/campaigns/campaign-1/locations/new${search}`] },
  )

  render(
    <QueryClientProvider client={makeTestQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return router
}

describe('LocationCreatePage prefill', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the create shell with type prefilled and no setup gate', () => {
    renderLocationCreatePage(`?${LOCATION_CREATE_TYPE_SEARCH_PARAM}=settlement`)

    const shell = screen.getByTestId('content-create-shell')
    expect(shell).toBeInTheDocument()
    expect(shell.getAttribute('data-initial-values')).toContain('"authoringType":"settlement"')
  })

  it('renders the inline create form for building type prefill', () => {
    renderLocationCreatePage(`?${LOCATION_CREATE_TYPE_SEARCH_PARAM}=building`)

    expect(screen.getByTestId('content-create-shell')).toBeInTheDocument()
  })
})
