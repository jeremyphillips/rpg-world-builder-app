import { describe, expect, it, vi } from 'vitest'

import { buildEmbeddedMasterDetailListItem } from './build-embedded-master-detail-list-item'

describe('buildEmbeddedMasterDetailListItem', () => {
  const field = { id: 'rhf-1' }
  const hasRowError = vi.fn(() => false)

  it('marks system seed rows as non-deletable with System and Homebrew badges context', () => {
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
      eyebrow: 'Level 1',
      deletable: false,
      hasError: false,
      active: true,
      badges: [{ label: 'System', appearance: 'soft', tone: 'neutral' }],
    })
  })

  it('allows homebrew rows to be deleted with a Homebrew badge', () => {
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
      deletable: true,
      hasError: false,
      badges: [{ label: 'Homebrew', appearance: 'outline', tone: 'neutral' }],
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
    expect(item.badges).toEqual([{ label: 'Homebrew', appearance: 'outline', tone: 'neutral' }])
    expect(hasRowError).toHaveBeenCalledWith(0)
  })
})
