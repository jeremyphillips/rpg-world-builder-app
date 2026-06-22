import { describe, expect, it, vi } from 'vitest'

import { buildEmbeddedMasterDetailListItem } from './build-embedded-master-detail-list-item'

describe('buildEmbeddedMasterDetailListItem', () => {
  const field = { id: 'rhf-1' }
  const hasRowError = vi.fn(() => false)

  it('marks system rows as non-deletable with a System badge', () => {
    const item = buildEmbeddedMasterDetailListItem({
      field,
      index: 0,
      row: { id: 'rage' },
      entitySource: 'system',
      hasRowError,
      title: 'Rage',
      eyebrow: 'Level 1',
    })

    expect(item).toEqual({
      id: 'rhf-1',
      title: 'Rage',
      eyebrow: 'Level 1',
      deletable: false,
      hasError: false,
      badge: { label: 'System', variant: 'secondary' },
    })
  })

  it('allows homebrew rows to be deleted without a badge', () => {
    const item = buildEmbeddedMasterDetailListItem({
      field,
      index: 1,
      row: { id: 'rage' },
      entitySource: 'homebrew',
      hasRowError,
      title: 'Rage',
    })

    expect(item).toEqual({
      id: 'rhf-1',
      title: 'Rage',
      deletable: true,
      hasError: false,
    })
  })

  it('surfaces row validation errors from hasRowError', () => {
    hasRowError.mockReturnValueOnce(true)

    const item = buildEmbeddedMasterDetailListItem({
      field,
      index: 0,
      row: {},
      entitySource: 'homebrew',
      hasRowError,
      title: 'Untitled',
    })

    expect(item.hasError).toBe(true)
    expect(hasRowError).toHaveBeenCalledWith(0)
  })
})
