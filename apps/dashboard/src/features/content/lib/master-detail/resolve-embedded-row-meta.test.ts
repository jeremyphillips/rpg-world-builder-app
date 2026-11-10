import { describe, expect, it } from 'vitest'

import { resolveEmbeddedRowMeta } from './resolve-embedded-row-meta'

describe('resolveEmbeddedRowMeta', () => {
  it('keeps a loaded system row system and persisted', () => {
    const meta = resolveEmbeddedRowMeta({
      row: { id: 'fighter-subclass' },
      entityCatalogLayer: 'system',
      persistedRowIds: new Set(['fighter-subclass', 'added']),
      systemOriginRowIds: new Set(['fighter-subclass']),
      extraReasons: [
        { code: 'subclasses-disabled', settingId: 'characterCreation.subclasses.enabled' },
      ],
    })

    expect(meta.availability.status).toBe('inactive')
    expect(meta.provenance).toBe('system')
    expect(meta.persistence).toBe('persisted')
    expect(meta.deletable).toBe(false)
  })

  it('keeps a homebrew row homebrew after its id is saved on a system parent', () => {
    const meta = resolveEmbeddedRowMeta({
      row: { id: 'added' },
      entityCatalogLayer: 'system',
      persistedRowIds: new Set(['fighter-subclass', 'added']),
      systemOriginRowIds: new Set(['fighter-subclass']),
    })

    expect(meta.provenance).toBe('homebrew')
    expect(meta.persistence).toBe('persisted')
    expect(meta.deletable).toBe(true)
  })

  it('marks a row missing from the saved entity as new without changing provenance', () => {
    const meta = resolveEmbeddedRowMeta({
      row: { id: 'fresh' },
      entityCatalogLayer: 'system',
      persistedRowIds: new Set(['fighter-subclass']),
      systemOriginRowIds: new Set(['fighter-subclass']),
    })

    expect(meta.provenance).toBe('homebrew')
    expect(meta.persistence).toBe('new')
  })

  it('treats every row on a homebrew parent as homebrew', () => {
    const meta = resolveEmbeddedRowMeta({
      row: { id: 'rage' },
      entityCatalogLayer: 'homebrew',
      persistedRowIds: new Set(['rage']),
      systemOriginRowIds: new Set(['rage']),
    })

    expect(meta.provenance).toBe('homebrew')
    expect(meta.persistence).toBe('persisted')
  })

  it('treats create mode as new', () => {
    const meta = resolveEmbeddedRowMeta({
      row: { id: 'fresh' },
      entityCatalogLayer: 'homebrew',
    })

    expect(meta.persistence).toBe('new')
    expect(meta.provenance).toBe('homebrew')
  })
})
