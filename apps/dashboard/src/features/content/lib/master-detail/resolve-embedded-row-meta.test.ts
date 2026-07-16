import { describe, expect, it } from 'vitest'

import { resolveEmbeddedRowMeta } from './resolve-embedded-row-meta'

describe('resolveEmbeddedRowMeta', () => {
  it('combines manual inactive state with extra availability reasons', () => {
    const meta = resolveEmbeddedRowMeta({
      row: { id: 'fighter-subclass' },
      entitySource: 'system',
      seedRowIds: new Set(['fighter-subclass']),
      activeById: { 'fighter-subclass': true },
      rowKey: 'fighter-subclass',
      extraReasons: [
        { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
      ],
    })

    expect(meta.active).toBe(false)
    expect(meta.availability.reasons).toEqual([
      { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
    ])
    expect(meta.badges).toEqual([
      { label: 'System', appearance: 'neutral', tone: 'neutral' },
      { label: 'Inactive', appearance: 'outline', tone: 'caution' },
    ])
  })

  it('adds the manual campaign toggle reason when the row is inactive', () => {
    const meta = resolveEmbeddedRowMeta({
      row: {},
      entitySource: 'homebrew',
      activeById: { 'rhf-1': false },
      rowKey: 'rhf-1',
    })

    expect(meta.availability).toEqual({
      status: 'inactive',
      reasons: [{ code: 'not-available-in-campaign' }],
    })
    expect(meta.badges.at(-1)).toEqual({
      label: 'Inactive',
      appearance: 'outline',
      tone: 'caution',
    })
  })
})
