import { describe, it } from 'vitest'

import { expectParseFailure, expectParseSuccess } from '../test/helpers/expect-zod-result'
import { nameGeneratorDefinitionSchema } from './collection'
import { ELVISH_PERSONAL_CONVENTION, FIXTURE_PROVENANCE } from './test-fixtures'
import { namingConventionSchema } from './naming-convention'

describe('nameGeneratorDefinitionSchema', () => {
  it('accepts sample, syllable, and compound generators', () => {
    expectParseSuccess(
      nameGeneratorDefinitionSchema.safeParse({
        type: 'sample',
        pools: [{ id: 'a', role: 'given', values: ['A'] }],
      }),
    )
    expectParseSuccess(
      nameGeneratorDefinitionSchema.safeParse({
        type: 'syllable',
        patterns: ['{onset}{nucleus}'],
        pools: { onset: ['b'], nucleus: ['a'] },
      }),
    )
    expectParseSuccess(
      nameGeneratorDefinitionSchema.safeParse({
        type: 'compound',
        parts: [{ pool: 'root' }],
        pools: { root: ['Iron'] },
      }),
    )
  })

  it('rejects unknown generator types', () => {
    expectParseFailure(nameGeneratorDefinitionSchema.safeParse({ type: 'markov' }), {
      message: /invalid/i,
    })
  })
})

describe('namingConventionSchema', () => {
  it('accepts a valid convention fixture', () => {
    expectParseSuccess(namingConventionSchema.safeParse(ELVISH_PERSONAL_CONVENTION))
  })

  it('rejects bindings for unknown part keys', () => {
    expectParseFailure(
      namingConventionSchema.safeParse({
        ...ELVISH_PERSONAL_CONVENTION,
        partBindings: [{ partKey: 'unknown', collectionId: 'elvish-given-pool' }],
      }),
      { path: ['partBindings', 0, 'partKey'] },
    )
  })

  it('rejects unreferenced collection ids', () => {
    expectParseFailure(
      namingConventionSchema.safeParse({
        ...ELVISH_PERSONAL_CONVENTION,
        collectionIds: ['elvish-given-pool', 'elvish-family-pool', 'orphan-collection'],
      }),
      { path: ['collectionIds', 2] },
    )
  })

  it('rejects bindings that reference ids outside collectionIds', () => {
    expectParseFailure(
      namingConventionSchema.safeParse({
        ...ELVISH_PERSONAL_CONVENTION,
        collectionIds: ['elvish-given-pool'],
      }),
      { path: ['partBindings', 1, 'collectionId'] },
    )
  })

  it('requires provenance', () => {
    const { provenance: _provenance, ...withoutProvenance } = ELVISH_PERSONAL_CONVENTION
    expectParseFailure(namingConventionSchema.safeParse(withoutProvenance), {
      path: ['provenance'],
    })
    expectParseSuccess(
      namingConventionSchema.safeParse({
        ...withoutProvenance,
        provenance: FIXTURE_PROVENANCE,
      }),
    )
  })
})
