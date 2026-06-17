import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, useMatches, type UIMatch } from 'react-router-dom'

import type { CrumbHandle } from '@/app/breadcrumbs'
import { AppBreadcrumb } from './app-breadcrumb'
import { BreadcrumbLabelContext } from './breadcrumb-label-context'
import type { BreadcrumbLabelContextValue } from './breadcrumb-label-context'

vi.mock('@/features/campaign', () => ({
  useCampaigns: () => ({
    data: [{ id: 'c1', identity: { name: 'Lost Mines' } }],
  }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return { ...actual, useMatches: vi.fn() }
})

const mockUseMatches = vi.mocked(useMatches)

function makeMatch(
  id: string,
  params: Record<string, string>,
  crumb?: CrumbHandle['crumb'],
): UIMatch {
  return {
    id,
    pathname: '/',
    params,
    data: undefined,
    loaderData: undefined,
    handle: crumb ? { crumb } : undefined,
  }
}

function renderBreadcrumb(entityLabel?: string) {
  const ctx: BreadcrumbLabelContextValue = {
    entityLabel,
    setEntityLabel: vi.fn(),
  }
  return render(
    <BreadcrumbLabelContext.Provider value={ctx}>
      <MemoryRouter>
        <AppBreadcrumb />
      </MemoryRouter>
    </BreadcrumbLabelContext.Provider>,
  )
}

describe('AppBreadcrumb', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders nothing when no route has a crumb handle', () => {
    mockUseMatches.mockReturnValue([makeMatch('root', {})])
    const { container } = renderBreadcrumb()
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a single current-page crumb with no link', () => {
    mockUseMatches.mockReturnValue([makeMatch('profile', {}, () => ({ label: 'Profile' }))])
    renderBreadcrumb()
    const page = screen.getByText('Profile')
    expect(page).toBeInTheDocument()
    expect(page.tagName).not.toBe('A')
    expect(page).toHaveAttribute('aria-current', 'page')
  })

  it('renders campaign > classes > entity chain with correct links', () => {
    mockUseMatches.mockReturnValue([
      makeMatch('campaign', { campaignId: 'c1' }, (params, { campaignName }) => ({
        label: campaignName ?? 'Campaign',
        href: `/campaigns/${params.campaignId}`,
      })),
      makeMatch('classes', { campaignId: 'c1' }, (params) => ({
        label: 'Classes',
        href: `/campaigns/${params.campaignId}/classes`,
      })),
      makeMatch('classDetail', { campaignId: 'c1', classId: 'x1' }, (_p, { entityLabel }) => ({
        label: entityLabel ?? '…',
      })),
    ])
    renderBreadcrumb('Wizard')

    const campaignLink = screen.getByRole('link', { name: 'Lost Mines' })
    expect(campaignLink).toHaveAttribute('href', '/campaigns/c1')

    const classesLink = screen.getByRole('link', { name: 'Classes' })
    expect(classesLink).toBeInTheDocument()

    expect(screen.getByText('Wizard')).toHaveAttribute('aria-current', 'page')
  })

  it('renders correct aria-label on the nav', () => {
    mockUseMatches.mockReturnValue([makeMatch('profile', {}, () => ({ label: 'Profile' }))])
    renderBreadcrumb()
    expect(screen.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument()
  })
})
