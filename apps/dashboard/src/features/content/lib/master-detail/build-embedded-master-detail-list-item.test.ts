import { describe, expect, it, vi } from 'vitest'

import { buildEmbeddedMasterDetailListItem } from './build-embedded-master-detail-list-item'

describe('buildEmbeddedMasterDetailListItem', () => {
  const field = { id: 'rhf-1' }
  const getRowIssueCount = vi.fn(() => 0)

  it('marks system seed rows as non-deletable with structured meta', () => {
    const item = buildEmbeddedMasterDetailListItem({
      field,
      index: 0,
      row: { id: 'rage' },
      entityCatalogLayer: 'system',
      seedRowIds: new Set(['rage']),
      getRowIssueCount,
      title: 'Rage',
      eyebrow: 'Level 1',
    })

    expect(item).toMatchObject({
      id: 'rage',
      title: 'Rage',
      meta: { eyebrow: 'Level 1', sourceLabel: 'System' },
      deletable: false,
      hasError: false,
    })
  })

  it('allows homebrew rows to be deleted with homebrew source meta', () => {
    const item = buildEmbeddedMasterDetailListItem({
      field,
      index: 1,
      row: { id: 'custom-feature' },
      entityCatalogLayer: 'system',
      seedRowIds: new Set(['rage']),
      getRowIssueCount,
      title: 'Custom Feature',
    })

    expect(item).toMatchObject({
      id: 'custom-feature',
      title: 'Custom Feature',
      meta: { sourceLabel: 'Homebrew' },
      deletable: true,
      hasError: false,
    })
  })

  it('surfaces row validation counts from getRowIssueCount', () => {
    getRowIssueCount.mockReturnValueOnce(2)

    const item = buildEmbeddedMasterDetailListItem({
      field,
      index: 0,
      row: {},
      entityCatalogLayer: 'homebrew',
      getRowIssueCount,
      title: 'Untitled',
    })

    expect(item.id).toBe('rhf-1')
    expect(item.issueCount).toBe(2)
    expect(item.hasError).toBe(true)
    expect(item.meta).toEqual({ sourceLabel: 'Homebrew' })
    expect(getRowIssueCount).toHaveBeenCalledWith(0)
  })
})
