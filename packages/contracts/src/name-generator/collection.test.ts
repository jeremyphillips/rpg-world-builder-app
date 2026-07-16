import { describe, expect, it } from 'vitest'

import { expectParseFailure, expectParseSuccess } from '../test/helpers/expect-zod-result'
import { COMPOUND_COLLECTION, ELVISH_GIVEN_COLLECTION, SYLLABLE_COLLECTION } from './test-fixtures'
import {
  getNameGeneratorKinds,
  nameCollectionSchema,
  nameGeneratorDefinitionSchema,
} from './collection'

describe('nameGeneratorDefinitionSchema', () => {
  it('accepts sample, syllable, and compound generators', () => {
    expectParseSuccess(nameGeneratorDefinitionSchema.safeParse(ELVISH_GIVEN_COLLECTION.generator))
    expectParseSuccess(nameGeneratorDefinitionSchema.safeParse(SYLLABLE_COLLECTION.generator))
    expectParseSuccess(nameGeneratorDefinitionSchema.safeParse(COMPOUND_COLLECTION.generator))
  })

  it('rejects unknown generator types', () => {
    expectParseFailure(
      nameGeneratorDefinitionSchema.safeParse({ type: 'template', template: '{given}' }),
      { message: /invalid/i },
    )
  })

  it('rejects sample generators with empty pools', () => {
    expectParseFailure(nameGeneratorDefinitionSchema.safeParse({ type: 'sample', pools: [] }), {
      path: ['pools'],
    })
  })
})

describe('nameCollectionSchema', () => {
  it('accepts a valid collection', () => {
    expectParseSuccess(nameCollectionSchema.safeParse(ELVISH_GIVEN_COLLECTION))
  })

  it('requires provenance and version', () => {
    expectParseFailure(
      nameCollectionSchema.safeParse({
        ...ELVISH_GIVEN_COLLECTION,
        provenance: undefined,
      }),
      { path: ['provenance'] },
    )
  })
})

describe('getNameGeneratorKinds', () => {
  it('returns the generator discriminator', () => {
    expect(getNameGeneratorKinds(ELVISH_GIVEN_COLLECTION.generator)).toEqual(['sample'])
    expect(getNameGeneratorKinds(SYLLABLE_COLLECTION.generator)).toEqual(['syllable'])
    expect(getNameGeneratorKinds(COMPOUND_COLLECTION.generator)).toEqual(['compound'])
  })
})
