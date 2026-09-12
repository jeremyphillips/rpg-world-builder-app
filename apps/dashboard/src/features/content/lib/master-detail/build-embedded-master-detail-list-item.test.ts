import { describe, expect, it, vi } from 'vitest'

import { buildEmbeddedMasterDetailListItem } from './build-embedded-master-detail-list-item'

describe('buildEmbeddedMasterDetailListItem', () => {
  const field = { id: 'rhf-1' }
  const hasRowError = vi.fn(() => false)

  it('marks system seed rows as non-deletable with structured meta', () => {
    const item = buildEmbeddedMasterDetailListItem({
      field,
      index: 0,
      row: { id: 'rage' },
      entitySource: 'system',
      seedRowIds: new Set(['rage']),
      hasRowError,
      title: 'Rage',
      eyebrow: 'Level 1',
    })

    expect(item).toMatchObject({
      id: 'rhf-1',
      title: 'Rage',
      meta: { eyebrow: 'Level 1', sourceLabel: 'System' },
      deletable: false,
      hasError: false,
      active: true,
    })
  })

  it('allows homebrew rows to be deleted with homebrew source meta', () => {
    const item = buildEmbeddedMasterDetailListItem({
      field,
      index: 1,
      row: { id: 'custom-feature' },
      entitySource: 'system',
      seedRowIds: new Set(['rage']),
      hasRowError,
      title: 'Custom Feature',
    })

    expect(item).toMatchObject({
      id: 'rhf-1',
      title: 'Custom Feature',
      meta: { sourceLabel: 'Homebrew' },
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
    expect(item.active).toBe(true)
    expect(item.meta).toEqual({ sourceLabel: 'Homebrew' })
    expect(hasRowError).toHaveBeenCalledWith(0)
  })
})
