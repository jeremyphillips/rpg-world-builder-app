import { describe, expect, it, vi } from 'vitest'

import {
  buildEmbeddedMasterDetailRows,
  findEmbeddedMasterDetailRowByFieldId,
  type BuildEmbeddedMasterDetailRowsParams,
} from './build-embedded-master-detail-rows'
import { defineMasterDetailItemNoun } from './master-detail-item-noun'

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

describe('buildEmbeddedMasterDetailRows', () => {
  const params: Omit<BuildEmbeddedMasterDetailRowsParams, 'access'> = {
    fields: [{ id: 'saved-field' }, { id: 'new-field' }],
    rowsSnapshot: [{ id: 'saved' }, {}],
    formCtx: { entityCatalogLayer: 'system' },
    itemNoun: defineMasterDetailItemNoun({ label: 'Action', singular: 'action' }),
    showDelete: true,
    resolveListDisplay: ({ index }) => ({
      title: index === 0 ? 'Saved action' : 'New action',
      eyebrow: 'Action',
      pipelineTitle: true,
    }),
    getRowIssueCount: (index) => (index === 1 ? 2 : 0),
    persistedRowIds: new Set(['saved']),
    systemOriginRowIds: new Set(['saved']),
  }

  it('preserves identity, badges and selection when access configuration is optional', () => {
    const plainRows = buildEmbeddedMasterDetailRows(params)
    const availableRows = buildEmbeddedMasterDetailRows({
      ...params,
      access: { kind: 'availability', fieldName: 'available' },
    })

    expect(plainRows.map(({ item }) => item)).toEqual(availableRows.map(({ item }) => item))
    expect(plainRows[0]?.item).toMatchObject({
      id: 'saved',
      deletable: false,
      meta: { persistence: 'persisted', provenance: 'system' },
    })
    expect(findEmbeddedMasterDetailRowByFieldId(plainRows, 'new-field')).toMatchObject({
      formIndex: 1,
      item: {
        id: 'new-field',
        issueCount: 2,
        hasError: true,
        meta: { persistence: 'new', provenance: 'homebrew' },
      },
    })
    expect(plainRows[0]?.availability.isAvailable).toBe(true)
  })

  it('only marks row availability when configured for that field', () => {
    const rows = buildEmbeddedMasterDetailRows({
      ...params,
      rowsSnapshot: [{ id: 'saved', available: false }, {}],
      access: { kind: 'availability', fieldName: 'available' },
    })
    expect(rows[0]).toMatchObject({
      item: { id: 'saved', availabilityStatusLabel: 'Unavailable' },
      availability: { rowId: 'saved', isAvailable: false },
    })
    expect(rows[1]?.item.availabilityStatusLabel).toBeUndefined()
  })
})
