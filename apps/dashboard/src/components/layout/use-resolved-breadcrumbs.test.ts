// @vitest-environment jsdom

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMatches, type UIMatch } from 'react-router-dom'

import type { BreadcrumbModeHandle, CrumbHandle } from '@/app/breadcrumbs'

import { useResolvedBreadcrumbs } from './use-resolved-breadcrumbs'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return { ...actual, useMatches: vi.fn() }
})

vi.mock('./use-breadcrumb-label', () => ({
  useBreadcrumbEntityLabel: () => 'Wizard',
}))

const mockUseMatches = vi.mocked(useMatches)

function makeMatch(
  pathname: string,
  params: Record<string, string>,
  handle?: CrumbHandle | BreadcrumbModeHandle,
): UIMatch {
  return {
    id: pathname,
    pathname,
    params,
    data: undefined,
    loaderData: undefined,
    handle,
  }
}

describe('useResolvedBreadcrumbs', () => {
  beforeEach(() => vi.clearAllMocks())

  it('omits collection href on index pages', () => {
    mockUseMatches.mockReturnValue([
      makeMatch(
        '/campaigns/c1/classes',
        { campaignId: 'c1' },
        {
          crumb: (_params, data) => ({
            label: 'Classes',
            href: data.isCollectionIndex ? undefined : '/campaigns/c1/classes',
          }),
        },
      ),
      makeMatch('/campaigns/c1/classes', { campaignId: 'c1' }),
    ])

    const { result } = renderHook(() => useResolvedBreadcrumbs())

    expect(result.current).toEqual([{ label: 'Classes' }])
  })

  it('keeps collection href on create pages', () => {
    mockUseMatches.mockReturnValue([
      makeMatch(
        '/campaigns/c1/classes',
        { campaignId: 'c1' },
        {
          crumb: (_params, data) => ({
            label: 'Classes',
            href: data.isCollectionIndex ? undefined : '/campaigns/c1/classes',
          }),
        },
      ),
      makeMatch('/campaigns/c1/classes/new', { campaignId: 'c1' }),
    ])

    const { result } = renderHook(() => useResolvedBreadcrumbs())

    expect(result.current).toEqual([
      {
        label: 'Classes',
        href: '/campaigns/c1/classes',
      },
    ])
  })

  it('adds entity detail href when breadcrumbMode is edit', () => {
    mockUseMatches.mockReturnValue([
      makeMatch(
        '/campaigns/c1/classes',
        { campaignId: 'c1' },
        {
          crumb: () => ({
            label: 'Classes',
            href: '/campaigns/c1/classes',
          }),
        },
      ),
      makeMatch(
        '/campaigns/c1/classes/wizard',
        { campaignId: 'c1', classId: 'wizard' },
        {
          crumb: (_params, data) => ({
            label: data.entityLabel ?? '…',
            href: data.breadcrumbMode === 'edit' ? '/campaigns/c1/classes/wizard' : undefined,
          }),
        },
      ),
      makeMatch(
        '/campaigns/c1/classes/wizard/edit',
        { campaignId: 'c1', classId: 'wizard' },
        {
          breadcrumbMode: 'edit',
        },
      ),
    ])

    const { result } = renderHook(() => useResolvedBreadcrumbs())

    expect(result.current).toEqual([
      { label: 'Classes', href: '/campaigns/c1/classes' },
      { label: 'Wizard', href: '/campaigns/c1/classes/wizard' },
    ])
  })
})
