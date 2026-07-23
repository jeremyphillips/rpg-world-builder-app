import { describe, expect, it } from 'vitest'

import { resolveEmbeddedRowMeta } from './resolve-embedded-row-meta'

describe('resolveEmbeddedRowMeta', () => {
  it('combines extra availability reasons into badges', () => {
    const meta = resolveEmbeddedRowMeta({
      row: { id: 'fighter-subclass' },
      entitySource: 'system',
      seedRowIds: new Set(['fighter-subclass']),
      extraReasons: [
        { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
      ],
    })

    expect(meta.availability.status).toBe('inactive')
    expect(meta.badges).toEqual([
      { label: 'System', appearance: 'neutral', tone: 'neutral' },
      { label: 'Inactive', appearance: 'outline', tone: 'warning' },
    ])
    expect(meta.deletable).toBe(false)
  })

  it('marks unsaved homebrew rows as deletable', () => {
    const meta = resolveEmbeddedRowMeta({
      row: {},
      entitySource: 'homebrew',
    })

    expect(meta.badges).toEqual([{ label: 'Homebrew', appearance: 'outline', tone: 'neutral' }])
    expect(meta.deletable).toBe(true)
    expect(meta.availability.status).toBe('active')
  })
})
