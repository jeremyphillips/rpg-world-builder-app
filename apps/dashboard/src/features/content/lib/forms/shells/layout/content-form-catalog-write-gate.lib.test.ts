import { describe, expect, it } from 'vitest'

import { resolveStrictCatalogWriteGateReason } from './content-form-catalog-write-gate.lib'

describe('resolveStrictCatalogWriteGateReason', () => {
  const copy = { loading: 'Loading…', error: 'Failed.' }

  it('returns null when the catalog is ready', () => {
    expect(resolveStrictCatalogWriteGateReason('ready', copy)).toBeNull()
    expect(resolveStrictCatalogWriteGateReason(undefined, copy)).toBeNull()
  })

  it('returns loading and error copy for pending and error states', () => {
    expect(resolveStrictCatalogWriteGateReason('pending', copy)).toBe('Loading…')
    expect(resolveStrictCatalogWriteGateReason('error', copy)).toBe('Failed.')
  })
})
