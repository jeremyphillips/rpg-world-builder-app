import { describe, expect, it } from 'vitest'

import {
  collectNavScrollSpyAnchors,
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

  it('falls back to the highest visible section when no leaf is visible', () => {
    expect(
      resolveActiveNavFromEntries([
        {
          id: 'creation',
          sectionId: 'creation',
          isLeaf: false,
          top: 5,
          ratio: 1,
        },
        {
          id: 'progression',
          sectionId: 'progression',
          isLeaf: false,
          top: 120,
          ratio: 0.2,
        },
      ]),
    ).toEqual({
      activeSectionId: 'creation',
    })
  })
})
