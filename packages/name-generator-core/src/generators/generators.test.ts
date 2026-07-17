import { describe, expect, it } from 'vitest'

import { NameGeneratorError } from '@rpg/contracts/name-generator'

import { generateCompoundPart } from './generate-compound-part'
import { generateSamplePart } from './generate-sample-part'
import { generateSyllablePart } from './generate-syllable-part'
import { createSeededRng } from '../random/create-seeded-rng'
import {
  COMPOUND_COLLECTION,
  ELVISH_GIVEN_COLLECTION,
  SYLLABLE_COLLECTION,
} from '@rpg/contracts/name-generator/test-fixtures'

describe('generateSamplePart', () => {
  it('selects gender-specific pools with fallback', () => {
    const rng = createSeededRng('gender-test')
    const generator = ELVISH_GIVEN_COLLECTION.generator
    if (generator.type !== 'sample') {
      throw new Error('expected sample generator')
    }
    const masculine = generateSamplePart(generator, rng, {
      sourceKey: 'given-masc',
      genderStyle: 'masculine',
    })
    expect(['Aelar', 'Adran', 'Aramil']).toContain(masculine)
  })

  it('throws for empty pools', () => {
    const rng = createSeededRng('empty')
    expect(() =>
      generateSamplePart(
        { type: 'sample', pools: [{ id: 'x', role: 'given', values: ['A'] }] },
        rng,
        {
          exclude: new Set(['A']),
        },
      ),
    ).toThrow(NameGeneratorError)
  })
})

describe('generateSyllablePart', () => {
  it('generates capitalized multi-syllable parts', () => {
    const rng = createSeededRng('syllable-test')
    const generator = SYLLABLE_COLLECTION.generator
    if (generator.type !== 'syllable') {
      throw new Error('expected syllable generator')
    }
    const value = generateSyllablePart(generator, rng)
    expect(value.length).toBeGreaterThan(0)
    expect(value[0]).toBe(value[0]?.toUpperCase())
  })
})

describe('generateCompoundPart', () => {
  it('joins compound segments', () => {
    const rng = createSeededRng('compound-test')
    const generator = COMPOUND_COLLECTION.generator
    if (generator.type !== 'compound') {
      throw new Error('expected compound generator')
    }
    const value = generateCompoundPart(generator, rng)
    expect(value.length).toBeGreaterThan(0)
  })
})
