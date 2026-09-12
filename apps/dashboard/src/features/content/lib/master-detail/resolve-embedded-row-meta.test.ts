import { describe, expect, it } from 'vitest'

import { resolveEmbeddedRowMeta } from './resolve-embedded-row-meta'

describe('resolveEmbeddedRowMeta', () => {
  it('marks inactive availability without list badges', () => {
    const meta = resolveEmbeddedRowMeta({
      row: { id: 'fighter-subclass' },
      entitySource: 'system',
      seedRowIds: new Set(['fighter-subclass']),
      extraReasons: [
        { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
      ],
    })

    expect(meta.availability.status).toBe('inactive')
    expect(meta.sourceLabel).toBe('System')
    expect(meta.deletable).toBe(false)
  })

  it('marks unsaved homebrew rows as deletable', () => {
    const meta = resolveEmbeddedRowMeta({
      row: {},
      entitySource: 'homebrew',
    })

    expect(meta.sourceLabel).toBe('Homebrew')
    expect(meta.deletable).toBe(true)
    expect(meta.availability.status).toBe('active')
  })
})
