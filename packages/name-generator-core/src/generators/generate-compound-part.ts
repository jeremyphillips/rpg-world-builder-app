import { NameGeneratorError, type CompoundNameGenerator } from '@rpg/contracts/name-generator'

import { pickFromPool } from '../lib/pick-from-pool'
import type { SeededRandom } from '../random/seeded-random'

// ---------------------------------------------------------------------------
// Compound part generation — chained pool segments with optional sections.
// ---------------------------------------------------------------------------

export function generateCompoundPart(generator: CompoundNameGenerator, rng: SeededRandom): string {
  const segments: string[] = []

  for (const part of generator.parts) {
    if (part.optional === true && rng.next() < 0.5) {
      continue
    }

    const pool = generator.pools[part.pool]
    if (pool === undefined || pool.length === 0) {
      if (part.optional === true) {
        continue
      }
      throw new NameGeneratorError('empty-pool', `Compound pool "${part.pool}" is empty`)
    }

    const value = pickFromPool(pool, rng)
    if (value === undefined) {
      throw new NameGeneratorError(
        'generation-exhausted',
        `Could not select from pool "${part.pool}"`,
      )
    }

    if (segments.length > 0 && part.separator !== undefined) {
      segments.push(part.separator)
    }

    segments.push(value)
  }

  const result = segments.join('')
  if (result.length === 0) {
    throw new NameGeneratorError(
      'generation-exhausted',
      'Compound generator produced an empty part',
    )
  }

  return result
}
