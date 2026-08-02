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

  it('renders game terms detail trail with param-derived category and hub link on overview', () => {
    mockUseMatches.mockReturnValue([
      makeMatch(
        '/campaigns/c1/game-terms',
        { campaignId: 'c1', setId: 'conditions' },
        {
          crumb: (params, data) => ({
            label: 'Game Terms',
            href: params.setId
              ? '/campaigns/c1/game-terms'
              : data.isCollectionIndex
                ? undefined
                : '/campaigns/c1/game-terms',
          }),
        },
      ),
      makeMatch(
        '/campaigns/c1/game-terms/conditions',
        { campaignId: 'c1', setId: 'conditions' },
        {
          crumb: (params, data) => {
            if (params.setId !== 'conditions') {
              return null
            }

            return {
              label: 'Conditions',
              href: params.termId
                ? data.isCollectionIndex
                  ? undefined
                  : '/campaigns/c1/game-terms/conditions'
                : undefined,
            }
          },
        },
      ),
      makeMatch('/campaigns/c1/game-terms/conditions', { campaignId: 'c1', setId: 'conditions' }),
    ])

    const { result } = renderHook(() => useResolvedBreadcrumbs())

    expect(result.current).toEqual([
      { label: 'Game Terms', href: '/campaigns/c1/game-terms' },
      { label: 'Conditions' },
    ])
  })

  it('renders game terms term detail with category href', () => {
    mockUseMatches.mockReturnValue([
      makeMatch(
        '/campaigns/c1/game-terms',
        { campaignId: 'c1', setId: 'conditions', termId: 'blinded' },
        {
          crumb: (params) => ({
            label: 'Game Terms',
            href: params.setId ? '/campaigns/c1/game-terms' : undefined,
          }),
        },
      ),
      makeMatch(
        '/campaigns/c1/game-terms/conditions',
        { campaignId: 'c1', setId: 'conditions', termId: 'blinded' },
        {
          crumb: (params) => ({
            label: 'Conditions',
            href: params.termId ? '/campaigns/c1/game-terms/conditions' : undefined,
          }),
        },
      ),
      makeMatch(
        '/campaigns/c1/game-terms/conditions/blinded',
        { campaignId: 'c1', setId: 'conditions', termId: 'blinded' },
        {
          crumb: (_params, { entityLabel }) => ({
            label: entityLabel ?? '…',
          }),
        },
      ),
    ])

    const { result } = renderHook(() => useResolvedBreadcrumbs())

    expect(result.current).toEqual([
      { label: 'Game Terms', href: '/campaigns/c1/game-terms' },
      { label: 'Conditions', href: '/campaigns/c1/game-terms/conditions' },
      { label: 'Wizard' },
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
