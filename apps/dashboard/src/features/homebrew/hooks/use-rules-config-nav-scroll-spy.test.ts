/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useRulesConfigNavScrollSpy } from './use-rules-config-nav-scroll-spy'
import {
  collectNavScrollSpyAnchors,
  measureAnchorTopRelativeToViewport,
  resolveActiveNavFromEntries,
} from './use-rules-config-nav-scroll-spy.lib'

describe('collectNavScrollSpyAnchors', () => {
  it('includes section and leaf ids', () => {
    expect(
      collectNavScrollSpyAnchors([
        {
          id: 'creation',
          label: 'Creation',
          leaves: [{ id: 'creation-starting-level', label: 'Starting level' }],
        },
        { id: 'progression', label: 'Progression' },
      ]),
    ).toEqual([
      { id: 'creation', sectionId: 'creation', isLeaf: false },
      { id: 'creation-starting-level', sectionId: 'creation', isLeaf: true },
      { id: 'progression', sectionId: 'progression', isLeaf: false },
    ])
  })
})

describe('measureAnchorTopRelativeToViewport', () => {
  it('measures relative to the viewport with a scroll offset', () => {
    const anchor = document.createElement('div')
    anchor.getBoundingClientRect = () =>
      ({
        top: 140,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 140,
        toJSON: () => ({}),
      }) as DOMRect

    expect(measureAnchorTopRelativeToViewport(anchor, 32)).toBe(108)
  })
})

describe('useRulesConfigNavScrollSpy', () => {
  let observerOptions: IntersectionObserverInit | undefined

  beforeEach(() => {
    observerOptions = undefined

    class MockIntersectionObserver {
      constructor(_callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        observerOptions = options
      }

      observe() {}
      unobserve() {}
      disconnect() {}
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('observes anchors relative to the viewport for document scroll', () => {
    renderHook(() => useRulesConfigNavScrollSpy([{ id: 'creation', label: 'Creation' }]))

    expect(observerOptions?.root).toBeNull()
  })
})

describe('resolveActiveNavFromEntries', () => {
  it('prefers the highest visible leaf and its section', () => {
    expect(
      resolveActiveNavFromEntries([
        {
          id: 'creation',
          sectionId: 'creation',
          isLeaf: false,
          top: 40,
          ratio: 0.8,
        },
        {
          id: 'creation-standard-array',
          sectionId: 'creation',
          isLeaf: true,
          top: 10,
          ratio: 0.6,
        },
      ]),
    ).toEqual({
      activeSectionId: 'creation',
      activeLeafId: 'creation-standard-array',
    })
  })
})
