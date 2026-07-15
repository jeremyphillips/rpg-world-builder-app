import { describe, expect, it } from 'vitest'

import {
  buildItemKeysByFieldId,
  collapsedIdsFromSnapshot,
  createArrayItemCollapseSnapshot,
  isArrayItemCollapsed,
  pruneArrayItemCollapseOverrides,
  resolveArrayItemCollapseKey,
  serializeArrayItemCollapseOverrides,
  toggleArrayItemCollapseOverride,
} from './array-item-collapse.lib'

describe('resolveArrayItemCollapseKey', () => {
  it('uses the configured stable field when present', () => {
    expect(resolveArrayItemCollapseKey({ id: 'darkvision' }, 0, 'id')).toBe('darkvision')
  })

  it('falls back to index when the stable field is missing', () => {
    expect(resolveArrayItemCollapseKey({}, 2, 'id')).toBe('index:2')
  })
})

describe('isArrayItemCollapsed', () => {
  const overrides = new Map<string, 'open' | 'closed'>()

  it('opens a sole item by default', () => {
    expect(isArrayItemCollapsed({ itemCount: 1, itemKey: 'a', overrides })).toBe(false)
  })

  it('closes items by default when count is two or more', () => {
    expect(isArrayItemCollapsed({ itemCount: 2, itemKey: 'a', overrides })).toBe(true)
  })

  it('honors user overrides over count defaults', () => {
    const withOverrides = new Map<string, 'open' | 'closed'>([
      ['a', 'open'],
      ['b', 'closed'],
    ])
    expect(isArrayItemCollapsed({ itemCount: 2, itemKey: 'a', overrides: withOverrides })).toBe(
      false,
    )
    expect(isArrayItemCollapsed({ itemCount: 1, itemKey: 'b', overrides: withOverrides })).toBe(
      true,
    )
  })
})

describe('toggleArrayItemCollapseOverride', () => {
  it('records open and closed overrides immutably', () => {
    const initial = createArrayItemCollapseSnapshot()
    const closed = toggleArrayItemCollapseOverride(initial, 'trait-1', true)
    expect(closed.overrides.get('trait-1')).toBe('closed')
    expect(initial.overrides.size).toBe(0)

    const open = toggleArrayItemCollapseOverride(closed, 'trait-1', false)
    expect(open.overrides.get('trait-1')).toBe('open')
  })
})

describe('pruneArrayItemCollapseOverrides', () => {
  it('drops overrides for removed items', () => {
    const snapshot = createArrayItemCollapseSnapshot({ a: 'open', b: 'closed', c: 'open' })
    const pruned = pruneArrayItemCollapseOverrides(snapshot, new Set(['a', 'c']))
    expect(serializeArrayItemCollapseOverrides(pruned)).toEqual({ a: 'open', c: 'open' })
  })
})

describe('collapsedIdsFromSnapshot', () => {
  const fields = [{ id: 'rhf-a' }, { id: 'rhf-b' }]
  const itemKeysByFieldId = new Map([
    ['rhf-a', 'a'],
    ['rhf-b', 'b'],
  ])

  it('maps stable keys to RHF field ids using count defaults', () => {
    const snapshot = createArrayItemCollapseSnapshot()
    expect(collapsedIdsFromSnapshot(fields, itemKeysByFieldId, snapshot, 1)).toEqual(new Set())
    expect(collapsedIdsFromSnapshot(fields, itemKeysByFieldId, snapshot, 2)).toEqual(
      new Set(['rhf-a', 'rhf-b']),
    )
  })

  it('maps open overrides back to expanded RHF ids', () => {
    const snapshot = createArrayItemCollapseSnapshot({ a: 'open' })
    expect(collapsedIdsFromSnapshot(fields, itemKeysByFieldId, snapshot, 2)).toEqual(
      new Set(['rhf-b']),
    )
  })
})

describe('buildItemKeysByFieldId', () => {
  it('indexes fields by RHF id', () => {
    const fields = [{ id: 'rhf-1' }, { id: 'rhf-2' }]
    const map = buildItemKeysByFieldId(
      fields,
      (index) => (index === 0 ? { id: 'stable-1' } : {}),
      'id',
    )
    expect(map.get('rhf-1')).toBe('stable-1')
    expect(map.get('rhf-2')).toBe('index:1')
  })
})
