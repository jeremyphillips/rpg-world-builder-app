import { describe, expect, it } from 'vitest'

import { FIXTURE_PROVENANCE } from '@rpg/contracts/name-generator/test-fixtures'
import type { NamingConvention } from '@rpg/contracts/name-generator'

import { resolveStructure } from './generate-name'

const MULTI_STRUCTURE_CONVENTION: NamingConvention = {
  id: 'test-multi-structure',
  label: 'Test multi-structure',
  subjectKinds: ['person'],
  associations: [],
  structures: [
    {
      id: 'alpha',
      label: 'Alpha',
      parts: [{ key: 'given', role: 'given', required: true }],
      format: '{given}',
    },
    {
      id: 'beta',
      label: 'Beta',
      parts: [
        { key: 'given', role: 'given', required: true },
        { key: 'suffix', role: 'family', required: true },
      ],
      format: '{given} {suffix}',
    },
  ],
  partBindings: [],
  collectionIds: [],
  provenance: FIXTURE_PROVENANCE,
  version: 1,
}

describe('resolveStructure', () => {
  it('returns the sole structure for single-structure conventions', () => {
    const convention: NamingConvention = {
      ...MULTI_STRUCTURE_CONVENTION,
      structures: [MULTI_STRUCTURE_CONVENTION.structures[0]!],
    }

    expect(resolveStructure(convention, undefined, 'seed', 0).id).toBe('alpha')
    expect(resolveStructure(convention, undefined, 'seed', 5).id).toBe('alpha')
  })

  it('honors an explicit structureId', () => {
    expect(resolveStructure(MULTI_STRUCTURE_CONVENTION, 'beta').id).toBe('beta')
  })

  it('seed-picks among structures when structureId is omitted', () => {
    const structureIds = new Set(
      Array.from(
        { length: 20 },
        (_, attemptIndex) =>
          resolveStructure(MULTI_STRUCTURE_CONVENTION, undefined, 'variant-seed', attemptIndex).id,
      ),
    )

    expect(structureIds).toEqual(new Set(['alpha', 'beta']))
  })

  it('is deterministic for the same seed and attempt index', () => {
    const first = resolveStructure(MULTI_STRUCTURE_CONVENTION, undefined, 'stable', 3)
    const second = resolveStructure(MULTI_STRUCTURE_CONVENTION, undefined, 'stable', 3)
    expect(second).toEqual(first)
  })
})
