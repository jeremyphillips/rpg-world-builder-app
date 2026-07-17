import { describe, expect, it, vi } from 'vitest'

import { NameGeneratorError } from '@rpg/contracts/name-generator'
import {
  ELVISH_GIVEN_COLLECTION,
  ELVISH_FAMILY_COLLECTION,
} from '@rpg/contracts/name-generator/test-fixtures'
import { listConventions } from '@rpg/name-generator-data'

import { generateNameBatch, mapNameGeneratorError } from './generate-name-batch'

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
      cultureId: 'high-elf',
      speciesId: 'srd-cc-5.2.1:elf',
    }

    const first = await generateNameBatch(
      filters,
      { seed: 'batch-seed', count: 3 },
      { loadCollection },
    )
    const second = await generateNameBatch(
      filters,
      { seed: 'batch-seed', count: 3 },
      { loadCollection },
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
        { listConventions },
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
        cultureId: 'common-orc',
        speciesId: 'srd-cc-5.2.1:orc',
      },
      { seed: 'orc-partial', count: 10 },
      { loadCollection, listConventions },
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
