import { describe, expect, it } from 'vitest'

import {
  catalogLifecycleDisplayMessage,
  catalogLifecycleUnresolvedReason,
  isCatalogAuthoritativeForReferenceLookup,
  mapAuthoringCatalogLoadState,
} from './catalog-lifecycle'

describe('mapAuthoringCatalogLoadState', () => {
  it.each([
    { status: 'pending' as const, loadState: 'loading' },
    { status: 'error' as const, loadState: 'error' },
    { status: 'ready' as const, loadState: 'ready' },
  ])('$status → $loadState', ({ status, loadState }) => {
    expect(mapAuthoringCatalogLoadState(status)).toBe(loadState)
  })
})

describe('catalog authority', () => {
  it('allows not-found only when load state is ready', () => {
    expect(isCatalogAuthoritativeForReferenceLookup('ready')).toBe(true)
    expect(isCatalogAuthoritativeForReferenceLookup('loading')).toBe(false)
    expect(isCatalogAuthoritativeForReferenceLookup('error')).toBe(false)
  })

  it('returns lifecycle reasons before lookup when not ready', () => {
    expect(catalogLifecycleUnresolvedReason('loading')).toBe('catalog-loading')
    expect(catalogLifecycleUnresolvedReason('error')).toBe('catalog-error')
    expect(catalogLifecycleUnresolvedReason('ready')).toBeUndefined()
  })
})

describe('catalogLifecycleDisplayMessage', () => {
  it('uses content-type vocabulary for equipment lifecycle copy', () => {
    expect(catalogLifecycleDisplayMessage('equipment', 'catalog-loading')).toBe(
      'Loading Equipment…',
    )
    expect(catalogLifecycleDisplayMessage('equipment', 'catalog-error')).toBe(
      'Could not load Equipment.',
    )
  })
})
