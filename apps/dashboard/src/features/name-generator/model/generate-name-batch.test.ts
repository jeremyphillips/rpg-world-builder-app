import { describe, expect, it, vi } from 'vitest'

import { NameGeneratorError } from '@rpg/contracts/name-generator'
import {
  ELVISH_GIVEN_COLLECTION,
  ELVISH_FAMILY_COLLECTION,
} from '@rpg/contracts/name-generator/test-fixtures'
import { listStaticConventions } from '@rpg/name-generator-data'

import { composeNameGeneratorConventions } from './compose-name-generator-conventions'
import { generateNameBatch, mapNameGeneratorError } from './generate-name-batch'

const ELF_SPECIES = {
  id: 'srd-cc-5.2.1:elf',
  slug: 'elf',
  name: 'Elf',
  source: 'system' as const,
  culture: {
    id: 'elven',
    name: 'Elven',
    naming: { supported: true, personalNameComponents: ['family' as const] },
  },
  languageAffinities: ['elvish'],
}

const ORC_SPECIES = {
  id: 'srd-cc-5.2.1:orc',
  slug: 'orc',
  name: 'Orc',
  source: 'system' as const,
  culture: {
    naming: { supported: true },
  },
  languageAffinities: ['orc'],
}

const { conventions, getConvention } = composeNameGeneratorConventions([ELF_SPECIES])
const { conventions: orcConventions, getConvention: getOrcConvention } =
  composeNameGeneratorConventions([ORC_SPECIES])

describe('generateNameBatch', () => {
  it('generates deterministic names for a seeded request', async () => {
    const loadCollection = vi.fn(async (collectionId: string) => {
      if (collectionId === 'elvish-given-pool') {
        return ELVISH_GIVEN_COLLECTION
      }
      if (collectionId === 'elvish-family-pool') {
        return ELVISH_FAMILY_COLLECTION
      }
      throw new Error(`Unexpected collection ${collectionId}`)
    })

    const filters = {
      subjectKind: 'person' as const,
      languageId: 'elvish' as const,
      cultureId: 'elven',
      speciesId: 'srd-cc-5.2.1:elf',
    }

    const first = await generateNameBatch(
      filters,
      { seed: 'batch-seed', count: 3 },
      { loadCollection, conventions, getConvention },
    )
    const second = await generateNameBatch(
      filters,
      { seed: 'batch-seed', count: 3 },
      { loadCollection, conventions, getConvention },
    )

    expect(first.results).toEqual(second.results)
    expect(first.results).toHaveLength(3)
    expect(first.matches.some((match) => match.conventionId === 'elvish-personal')).toBe(true)
  })

  it('throws a no-match page error when filters match nothing', async () => {
    await expect(
      generateNameBatch(
        {
          subjectKind: 'ship',
        },
        { seed: 'empty', count: 3 },
        { conventions: listStaticConventions() },
      ),
    ).rejects.toMatchObject({
      kind: 'no-matches',
    })
  })

  it('returns partial results when a convention pool is exhausted', async () => {
    const tinyOrcGivenCollection = {
      ...ELVISH_GIVEN_COLLECTION,
      id: 'orc-given-pool',
      generator: {
        type: 'sample' as const,
        pools: [
          {
            id: 'given-masc',
            role: 'given' as const,
            genderStyle: 'masculine' as const,
            values: ['A', 'B', 'C'],
          },
        ],
      },
    }

    const loadCollection = vi.fn(async () => tinyOrcGivenCollection)

    const batch = await generateNameBatch(
      {
        subjectKind: 'person',
        languageId: 'orc',
        cultureId: 'orc',
        speciesId: 'srd-cc-5.2.1:orc',
      },
      { seed: 'orc-partial', count: 10 },
      { loadCollection, conventions: orcConventions, getConvention: getOrcConvention },
    )

    expect(batch.results).toHaveLength(3)
    expect(batch.partialCount).toEqual({ generated: 3, requested: 10 })
  })
})

describe('mapNameGeneratorError', () => {
  it('maps collection load failures', () => {
    expect(
      mapNameGeneratorError(new NameGeneratorError('missing-collection', 'missing')),
    ).toMatchObject({ kind: 'collection-load' })
  })
})
