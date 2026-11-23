import { describe, expect, it } from 'vitest'

import {
  createSpellCatalogContext,
  isSpellCatalogAuthoritativeForReferenceLookup,
  mapAuthoringSpellCatalogLoadState,
  SPELL_REFERENCE_DISPLAY_MESSAGES,
  spellCatalogLifecycleUnresolvedReason,
  spellReferenceDisplayMessageForUnresolvedReason,
} from './spell-catalog-context'

describe('mapAuthoringSpellCatalogLoadState', () => {
  it.each([
    { status: 'pending' as const, loadState: 'loading' },
    { status: 'error' as const, loadState: 'error' },
    { status: 'ready' as const, loadState: 'ready' },
  ])('$status → $loadState', ({ status, loadState }) => {
    expect(mapAuthoringSpellCatalogLoadState(status)).toBe(loadState)
  })
})

describe('catalog authority for unknown-spell reporting', () => {
  it('allows not-found only when load state is ready', () => {
    expect(isSpellCatalogAuthoritativeForReferenceLookup('ready')).toBe(true)
    expect(isSpellCatalogAuthoritativeForReferenceLookup('loading')).toBe(false)
    expect(isSpellCatalogAuthoritativeForReferenceLookup('error')).toBe(false)
  })

  it('returns lifecycle reasons before lookup when not ready', () => {
    expect(spellCatalogLifecycleUnresolvedReason('loading')).toBe('catalog-loading')
    expect(spellCatalogLifecycleUnresolvedReason('error')).toBe('catalog-error')
    expect(spellCatalogLifecycleUnresolvedReason('ready')).toBeUndefined()
  })
})

describe('createSpellCatalogContext', () => {
  it('bundles load state with spellsById', () => {
    const spellsById = new Map([['srd:fire-bolt', { id: 'srd:fire-bolt' } as never]])
    expect(createSpellCatalogContext({ status: 'ready', spellsById })).toEqual({
      loadState: 'ready',
      spellsById,
    })
  })
})

describe('spellReferenceDisplayMessageForUnresolvedReason', () => {
  it('maps semantic reasons to canonical presentation copy', () => {
    expect(spellReferenceDisplayMessageForUnresolvedReason('unknown-spell')).toBe(
      SPELL_REFERENCE_DISPLAY_MESSAGES.unknownSpell,
    )
    expect(spellReferenceDisplayMessageForUnresolvedReason('catalog-loading')).toBe(
      SPELL_REFERENCE_DISPLAY_MESSAGES.catalogLoading,
    )
    expect(spellReferenceDisplayMessageForUnresolvedReason('catalog-error')).toBe(
      SPELL_REFERENCE_DISPLAY_MESSAGES.catalogError,
    )
    expect(spellReferenceDisplayMessageForUnresolvedReason('catalog-unavailable')).toBe(
      SPELL_REFERENCE_DISPLAY_MESSAGES.catalogError,
    )
  })
})
