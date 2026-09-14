/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { appStickyChromeBlockSizeFallbackPx } from '@/components/layout/shell/app-shell.variants'

import { useRulesConfigNavScrollSpy } from './use-rules-config-nav-scroll-spy'
import {
  collectNavScrollSpyAnchors,
  measureAnchorTopRelativeToViewport,
  resolveActiveNavFromEntries,
  resolveStickyChromeBlockSizePx,
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

describe('useRulesConfigNavScrollSpy', () => {
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
      useRulesConfigNavScrollSpy([
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

  it('prefers the last passed anchor in document order, not the closest to the offset', () => {
    expect(
      resolveActiveNavFromEntries([
        {
          id: 'creation-imported-characters',
          sectionId: 'creation',
          isLeaf: true,
          top: -7,
          ratio: 0,
        },
        {
          id: 'progression',
          sectionId: 'progression',
          isLeaf: false,
          top: -200,
          ratio: 0,
        },
        {
          id: 'progression-standard-max-level',
          sectionId: 'progression',
          isLeaf: true,
          top: 80,
          ratio: 0,
        },
      ]),
    ).toEqual({
      activeSectionId: 'progression',
    })
  })

  it('prefers the last passed leaf closest to the sticky offset', () => {
    expect(
      resolveActiveNavFromEntries([
        {
          id: 'creation',
          sectionId: 'creation',
          isLeaf: false,
          top: -1192,
          ratio: 0.11,
        },
        {
          id: 'progression',
          sectionId: 'progression',
          isLeaf: false,
          top: -400,
          ratio: 0,
        },
        {
          id: 'progression-standard-max-level',
          sectionId: 'progression',
          isLeaf: true,
          top: -350,
          ratio: 0,
        },
      ]),
    ).toEqual({
      activeSectionId: 'progression',
      activeLeafId: 'progression-standard-max-level',
    })
  })

  it('highlights leafless sections once their heading crosses the offset', () => {
    expect(
      resolveActiveNavFromEntries([
        {
          id: 'multiclassing',
          sectionId: 'multiclassing',
          isLeaf: false,
          top: -20,
          ratio: 0,
        },
        {
          id: 'subclasses',
          sectionId: 'subclasses',
          isLeaf: false,
          top: 180,
          ratio: 0,
        },
      ]),
    ).toEqual({
      activeSectionId: 'multiclassing',
    })
  })
})
