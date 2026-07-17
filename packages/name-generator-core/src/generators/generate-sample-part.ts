import {
  NameGeneratorError,
  type NameGenderStyle,
  type NamePool,
  type SampleNameGenerator,
} from '@rpg/contracts/name-generator'

import { pickFromPool } from '../lib/pick-from-pool'
import type { SeededRandom } from '../random/seeded-random'

// ---------------------------------------------------------------------------
// Sample pool selection with gender-style fallback.
// ---------------------------------------------------------------------------

const GENDER_FALLBACK_ORDER: NameGenderStyle[] = ['shared', 'neutral', 'not-applicable']

function poolMatchesGender(pool: NamePool, genderStyle: NameGenderStyle | undefined): boolean {
  if (genderStyle === undefined) {
    return true
  }
  if (pool.genderStyle === undefined) {
    return true
  }
  return pool.genderStyle === genderStyle
}

function selectSamplePool(
  generator: SampleNameGenerator,
  sourceKey: string | undefined,
  genderStyle: NameGenderStyle | undefined,
): NamePool | undefined {
  if (sourceKey !== undefined) {
    const explicit = generator.pools.find((pool) => pool.id === sourceKey)
    if (explicit !== undefined) {
      return explicit
    }
  }

  const genderMatched = generator.pools.filter((pool) => poolMatchesGender(pool, genderStyle))
  if (genderMatched.length > 0) {
    return genderMatched[0]
  }

  if (genderStyle !== undefined) {
    for (const fallback of GENDER_FALLBACK_ORDER) {
      const pool = generator.pools.find((candidate) => candidate.genderStyle === fallback)
      if (pool !== undefined) {
        return pool
      }
    }
  }

  return generator.pools[0]
}

export function generateSamplePart(
  generator: SampleNameGenerator,
  rng: SeededRandom,
  options: {
    sourceKey?: string
    genderStyle?: NameGenderStyle
    exclude?: ReadonlySet<string>
  } = {},
): string {
  const pool = selectSamplePool(generator, options.sourceKey, options.genderStyle)
  if (pool === undefined || pool.values.length === 0) {
    throw new NameGeneratorError('empty-pool', 'Sample generator has no usable pools')
  }

  const value = pickFromPool(pool.values, rng, options.exclude)
  if (value === undefined) {
    throw new NameGeneratorError('generation-exhausted', 'Could not select a sample pool value')
  }

  return value
}
