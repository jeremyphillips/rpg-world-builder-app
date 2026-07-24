import type { ComponentProps } from 'react'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { ContentOverviewNameCell } from './content-overview-name-cell.client'

function renderNameCell(props: Partial<ComponentProps<typeof ContentOverviewNameCell>> = {}) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <ContentOverviewNameCell
            name="Fighter"
            status="published"
            campaignAccess={DEFAULT_CONTENT_CAMPAIGN_ACCESS}
            nameHref="/classes/fighter"
            {...props}
          />
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
