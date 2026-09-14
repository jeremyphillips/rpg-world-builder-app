import { describe, expect, it } from 'vitest'

import { resolveSelectedIndexById, selectIdAtIndex } from './resolve-master-detail-selected-index'

describe('resolveSelectedIndexById', () => {
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

  it('returns null when selectedId is null', () => {
    expect(resolveSelectedIndexById(items, null)).toBeNull()
  })

  it('returns the matching index for a known id', () => {
    expect(resolveSelectedIndexById(items, 'b')).toBe(1)
  })

  it('returns null when the id is not in the list', () => {
    expect(resolveSelectedIndexById(items, 'missing')).toBeNull()
  })
})

describe('selectIdAtIndex', () => {
  const items = [{ id: 'a' }, { id: 'b' }]

  it('returns the id at the given index', () => {
    expect(selectIdAtIndex(items, 1)).toBe('b')
  })

  it('returns undefined for out-of-range indices', () => {
    expect(selectIdAtIndex(items, 5)).toBeUndefined()
  })
})
