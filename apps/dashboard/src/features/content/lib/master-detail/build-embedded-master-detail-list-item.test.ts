import { describe, expect, it, vi } from 'vitest'

import { buildEmbeddedMasterDetailListItem } from './build-embedded-master-detail-list-item'

describe('buildEmbeddedMasterDetailListItem', () => {
  const field = { id: 'rhf-1' }
  const getRowIssueCount = vi.fn(() => 0)
  const origin = new Set(['rage'])
  const persisted = new Set(['rage', 'custom-feature'])

  it('marks system-origin rows as non-deletable', () => {
    const item = buildEmbeddedMasterDetailListItem({
      field,
      index: 0,
      row: { id: 'rage' },
      entityCatalogLayer: 'system',
      persistedRowIds: persisted,
      systemOriginRowIds: origin,
      getRowIssueCount,
      title: 'Rage',
      eyebrow: 'Level 1',
    })

    expect(item).toMatchObject({
      id: 'rage',
      title: 'Rage',
      meta: {
        eyebrow: 'Level 1',
        provenance: 'system',
        persistence: 'persisted',
      },
      deletable: false,
      hasError: false,
    })
  })

  it('keeps a saved homebrew addition deletable and homebrew', () => {
    const item = buildEmbeddedMasterDetailListItem({
      field,
      index: 1,
      row: { id: 'custom-feature' },
      entityCatalogLayer: 'system',
      persistedRowIds: persisted,
      systemOriginRowIds: origin,
      getRowIssueCount,
      title: 'Custom Feature',
      kindLabel: 'Feature',
    })

    expect(item).toMatchObject({
      id: 'custom-feature',
      title: 'Custom Feature',
      meta: {
        kindLabel: 'Feature',
        provenance: 'homebrew',
        persistence: 'persisted',
      },
      deletable: true,
    })
  })

  it('does not let a kind label replace provenance or persistence', () => {
    const item = buildEmbeddedMasterDetailListItem({
      field,
      index: 1,
      row: { id: 'custom-feature' },
      entityCatalogLayer: 'system',
      persistedRowIds: persisted,
      systemOriginRowIds: origin,
      getRowIssueCount,
      title: 'Custom Feature',
      kindLabel: 'System',
    })

    expect(item.meta?.provenance).toBe('homebrew')
    expect(item.meta?.persistence).toBe('persisted')
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
    expect(item.meta).toEqual({ provenance: 'homebrew', persistence: 'new' })
    expect(getRowIssueCount).toHaveBeenCalledWith(0)
  })
})
