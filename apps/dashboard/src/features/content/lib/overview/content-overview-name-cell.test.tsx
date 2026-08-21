import type { ComponentProps } from 'react'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { ContentOverviewNameCell } from './content-overview-name-cell'
import { contentOverviewListQueryKey } from './content-overview-query-keys'

function renderNameCell(props: Partial<ComponentProps<typeof ContentOverviewNameCell>> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <QueryClientProvider client={queryClient}>
            <ContentOverviewNameCell
              name="Fighter"
              status="published"
              campaignAccess={DEFAULT_CONTENT_CAMPAIGN_ACCESS}
              nameHref="/classes/fighter"
              campaignId="camp-1"
              contentTypeKey="classes"
              queryKeyFn={(id) => contentOverviewListQueryKey(id, 'classes')}
              duplicateSource={{ id: 'cls-1', name: 'Fighter', source: 'homebrew' }}
              {...props}
            />
          </QueryClientProvider>
        ),
      },
    ],
    { initialEntries: ['/'] },
  )

  return render(<RouterProvider router={router} />)
}

describe('ContentOverviewNameCell', () => {
  it('renders name link and draft badge on line 1', () => {
    renderNameCell({ status: 'draft' })

    expect(screen.getByRole('link', { name: 'Fighter' })).toHaveAttribute(
      'href',
      '/classes/fighter',
    )
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders manager utility row with edit link and reserved line height', () => {
    renderNameCell({
      canManage: true,
      editHref: '/classes/fighter/edit',
    })

    expect(screen.getByRole('link', { name: 'Edit' })).toHaveAttribute(
      'href',
      '/classes/fighter/edit',
    )
    expect(screen.getByRole('button', { name: 'Duplicate' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Edit' }).closest('.min-h-4')).toBeInTheDocument()
  })

  it('shows manager access metadata for restricted rows', () => {
    renderNameCell({
      canManage: true,
      editHref: '/classes/fighter/edit',
      campaignAccess: {
        ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        available: true,
        visibilityMode: 'dm_only',
      },
    })

    expect(screen.getByText('DM only')).toBeInTheDocument()
  })

  it('omits line 2 for non-managers', () => {
    renderNameCell({ canManage: false })

    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument()
    expect(screen.queryByText('DM only')).not.toBeInTheDocument()
  })
})
