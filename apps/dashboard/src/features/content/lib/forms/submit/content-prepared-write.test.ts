import { describe, expect, it } from 'vitest'

import {
  assertContentPreparedWritePairing,
  buildIdentityPreparedWrite,
} from './content-prepared-write.types'
import { projectCompactedArrayProvenance } from './project-compacted-array-provenance.lib'

describe('content prepared write provenance', () => {
  it('accepts identity provenance without mapping', () => {
    const prepared = buildIdentityPreparedWrite({ name: 'Dragon' })
    expect(() => assertContentPreparedWritePairing(prepared)).not.toThrow()
    expect(prepared.payload).toEqual({ name: 'Dragon' })
  })

  it('rejects invalid path map pairings', () => {
    expect(() =>
      assertContentPreparedWritePairing({
        payload: { name: 'Dragon' },
        provenance: { pathMap: { '': 'wire.name' } },
      }),
    ).toThrow(/non-empty/)
    expect(() =>
      assertContentPreparedWritePairing({
        payload: { name: 'Dragon' },
        provenance: { pathMap: { name: '' } },
      }),
    ).toThrow(/wire path/)
  })

  it('records surviving row indices after compaction', () => {
    const source = ['a', null, 'b', undefined, 'c']
    const { filteredRowIndexBySourceIndex } = projectCompactedArrayProvenance(
      'actions',
      source.length,
      (index) => source[index] != null,
    )

    expect(filteredRowIndexBySourceIndex).toEqual({
      actions: {
        0: 0,
        2: 1,
        4: 2,
      },
    })
  })

  it('maps request validation paths through declared wire overrides', () => {
    const prepared = buildIdentityPreparedWrite({ name: 'Dragon' })
    prepared.provenance.pathMap = { name: 'displayName' }
    assertContentPreparedWritePairing(prepared)

    const wirePath = prepared.provenance.pathMap!.name
    expect(wirePath).toBe('displayName')
    expect(prepared.payload).toEqual({ name: 'Dragon' })
  })
})
