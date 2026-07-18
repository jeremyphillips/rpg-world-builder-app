import { describe, expect, it } from 'vitest'

import { expectParseFailure, expectParseSuccess } from '../test/helpers/expect-zod-result'
import { COMPOUND_COLLECTION, ELVISH_GIVEN_COLLECTION, SYLLABLE_COLLECTION } from './test-fixtures'
import {
  getNameGeneratorKinds,
  NAME_POOL_ROLES,
  nameCollectionSchema,
  nameGeneratorDefinitionSchema,
} from './collection'
import { NAME_PART_ROLES } from './name-structure'

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

describe('name pool roles', () => {
  it('includes every part role and only complete as the extra pool role', () => {
    const partRoleSet = new Set<string>(NAME_PART_ROLES)

    for (const role of NAME_PART_ROLES) {
      expect(NAME_POOL_ROLES).toContain(role)
    }

    const extraPoolRoles = NAME_POOL_ROLES.filter((role) => !partRoleSet.has(role))
    expect(extraPoolRoles).toEqual(['complete'])
  })
})
