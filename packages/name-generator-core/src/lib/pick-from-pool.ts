import { MAX_DUPLICATE_ATTEMPTS } from '@rpg/contracts/name-generator'

import type { SeededRandom } from '../random/seeded-random'

// ---------------------------------------------------------------------------
// Pick a value from a pool with exclusion and duplicate-attempt limits.
// ---------------------------------------------------------------------------

export function pickFromPool(
  pool: readonly string[],
  rng: SeededRandom,
  exclude: ReadonlySet<string> = new Set(),
  maxAttempts: number = MAX_DUPLICATE_ATTEMPTS,
): string | undefined {
  if (pool.length === 0) {
    return undefined
  }

  const available = pool.filter((value) => !exclude.has(value))
  if (available.length === 0) {
    return undefined
  }

  const attempts = Math.min(maxAttempts, available.length)
  const tried = new Set<string>()

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const candidate = available[rng.nextInt(available.length)] ?? available[0]
    if (candidate === undefined) {
      continue
    }
    if (!exclude.has(candidate) && !tried.has(candidate)) {
      return candidate
    }
    tried.add(candidate)
  }

  return available[rng.nextInt(available.length)]
}
