import { describe, expect, it } from 'vitest'

import { canonicalJson } from './canonical-json'

describe('canonicalJson', () => {
  it('sorts keys, drops undefined, and normalizes strings to NFC', () => {
    const composed = 'e\u0301'
    expect(canonicalJson({ b: 1, a: composed, c: undefined })).toBe(
      JSON.stringify({ a: composed.normalize('NFC'), b: 1 }),
    )
    expect(canonicalJson({ nested: { z: [composed, 2], a: true } })).toBe(
      canonicalJson({ nested: { a: true, z: [composed.normalize('NFC'), 2] } }),
    )
  })
})
