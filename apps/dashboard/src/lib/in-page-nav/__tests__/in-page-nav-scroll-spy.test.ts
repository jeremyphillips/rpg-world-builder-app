/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { appStickyChromeBlockSizeFallbackPx } from '@/components/layout/shell/app-shell.variants'

import {
  collectNavScrollSpyAnchors,
  measureAnchorTopRelativeToViewport,
  resolveActiveNavFromEntries,
  resolveStickyChromeBlockSizePx,
} from '../in-page-nav-scroll-spy.lib'
import { useInPageNavScrollSpy } from '../use-in-page-nav-scroll-spy'

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

describe('resolveStickyChromeBlockSizePx', () => {
  it('falls back to the named app shell chrome block size', () => {
    expect(resolveStickyChromeBlockSizePx()).toBe(appStickyChromeBlockSizeFallbackPx)
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

describe('useInPageNavScrollSpy', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('activates the nearest passed anchor on scroll', () => {
    const creation = document.createElement('div')
    creation.id = 'creation'
    const progression = document.createElement('div')
    progression.id = 'progression'
    document.body.append(creation, progression)

    creation.getBoundingClientRect = () =>
      ({
        top: 50,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 50,
        toJSON: () => ({}),
      }) as DOMRect
    progression.getBoundingClientRect = () =>
      ({
        top: 90,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 90,
        toJSON: () => ({}),
      }) as DOMRect

    const { result } = renderHook(() =>
      useInPageNavScrollSpy([
        { id: 'creation', label: 'Creation' },
        { id: 'progression', label: 'Progression' },
      ]),
    )

    window.dispatchEvent(new Event('scroll'))

    expect(result.current.activeSectionId).toBe('progression')
  })
})

describe('resolveActiveNavFromEntries', () => {
  it('highlights the nearest anchor below the offset before any section is passed', () => {
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
