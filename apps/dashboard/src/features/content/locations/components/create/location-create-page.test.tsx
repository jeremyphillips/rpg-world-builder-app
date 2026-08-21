import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeTestQueryClient } from '@/test/render'

import {
  LOCATION_CREATE_SITE_TYPE_SEARCH_PARAM,
  LOCATION_CREATE_TYPE_SEARCH_PARAM,
} from '../../lib/create/location-create-shortcuts'
import { SITE_CREATE_SETUP_PROMPT } from '../../lib/create/setup/location-site-create-setup.lib'
import { LocationCreatePage } from './location-create-page'

vi.mock('@/features/campaign', () => ({
  useCampaigns: () => ({ data: [] }),
}))

vi.mock('../../../lib/forms/shells/create/content-create-shell', () => ({
  ContentCreateShell: ({ heading }: { heading: string }) => (
    <div data-testid="content-create-shell">{heading}</div>
  ),
}))

vi.mock('./location-create-modal', () => ({
  LocationCreateModal: () => <div data-testid="location-create-modal" />,
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

describe('LocationCreatePage setup shell path', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('routes site setup through CreateSetupShell and navigates to fixed create on Continue', async () => {
    const user = userEvent.setup()
    const router = renderLocationCreatePage(`?${LOCATION_CREATE_TYPE_SEARCH_PARAM}=site`)

    expect(screen.getByRole('radiogroup', { name: SITE_CREATE_SETUP_PROMPT })).toBeInTheDocument()
    expect(screen.queryByTestId('content-create-shell')).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: (name) => name.startsWith('Ruin') }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      const params = new URLSearchParams(router.state.location.search)
      expect(params.get(LOCATION_CREATE_TYPE_SEARCH_PARAM)).toBe('site')
      expect(params.get(LOCATION_CREATE_SITE_TYPE_SEARCH_PARAM)).toBe('ruin')
      expect(screen.getByTestId('content-create-shell')).toBeInTheDocument()
    })
  })

  it('keeps building create on the modal path instead of CreateSetupShell', () => {
    renderLocationCreatePage(`?${LOCATION_CREATE_TYPE_SEARCH_PARAM}=building`)

    expect(screen.getByTestId('location-create-modal')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue' })).not.toBeInTheDocument()
  })
})
