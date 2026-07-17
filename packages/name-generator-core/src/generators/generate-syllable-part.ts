import { NameGeneratorError, type SyllableNameGenerator } from '@rpg/contracts/name-generator'

import { pickFromPool } from '../lib/pick-from-pool'
import type { SeededRandom } from '../random/seeded-random'

// ---------------------------------------------------------------------------
// Syllable-based part generation from pattern templates.
// ---------------------------------------------------------------------------

const SYLLABLE_TOKEN_PATTERN = /\{([a-zA-Z]+)\}/g
const MAX_SYLLABLE_ATTEMPTS = 10

function pickPoolValue(
  pools: SyllableNameGenerator['pools'],
  key: string,
  rng: SeededRandom,
): string {
  const values = pools[key as keyof typeof pools]
  if (values === undefined || values.length === 0) {
    return ''
  }
  return pickFromPool(values, rng) ?? values[0] ?? ''
}

function expandPattern(
  pattern: string,
  pools: SyllableNameGenerator['pools'],
  rng: SeededRandom,
): string {
  return pattern.replace(SYLLABLE_TOKEN_PATTERN, (_match, key: string) =>
    pickPoolValue(pools, key, rng),
  )
}

function resolveSyllableCount(generator: SyllableNameGenerator, rng: SeededRandom): number {
  const minSyllables = generator.constraints?.minSyllables ?? 1
  const maxSyllables = generator.constraints?.maxSyllables ?? minSyllables
  if (minSyllables === maxSyllables) {
    return minSyllables
  }
  return minSyllables + rng.nextInt(maxSyllables - minSyllables + 1)
}

function buildSyllableValue(
  generator: SyllableNameGenerator,
  syllableCount: number,
  rng: SeededRandom,
): string {
  const syllables: string[] = []
  for (let index = 0; index < syllableCount; index += 1) {
    const pattern = generator.patterns[rng.nextInt(generator.patterns.length)]
    if (pattern !== undefined) {
      syllables.push(expandPattern(pattern, generator.pools, rng))
    }
  }

  let value = syllables.join('')
  if (generator.constraints?.capitalize === true && value.length > 0) {
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }
  return value
}

function isAllowedSyllableValue(value: string, disallowed: readonly string[] | undefined): boolean {
  if (value.length === 0) {
    return false
  }
  if (disallowed === undefined) {
    return true
  }
  return !disallowed.some((sequence) => value.includes(sequence))
}

export function generateSyllablePart(generator: SyllableNameGenerator, rng: SeededRandom): string {
  const syllableCount = resolveSyllableCount(generator, rng)
  const disallowed = generator.constraints?.disallowedSequences

  for (let attempt = 0; attempt < MAX_SYLLABLE_ATTEMPTS; attempt += 1) {
    const value = buildSyllableValue(generator, syllableCount, rng)
    if (isAllowedSyllableValue(value, disallowed)) {
      return value
    }
  }

  throw new NameGeneratorError('generation-exhausted', 'Could not generate a valid syllable part')
}
