import { createMulberry32 } from './seeded-random'

// ---------------------------------------------------------------------------
// Derive a numeric seed from one or more string components.
// ---------------------------------------------------------------------------

export function hashSeedString(value: string): number {
  let hash = 1779033703 ^ value.length

  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353)
    hash = (hash << 13) | (hash >>> 19)
  }

  return (hash ^ (hash >>> 16)) >>> 0
}

export function createSeededRng(...parts: string[]) {
  return createMulberry32(hashSeedString(parts.join(':')))
}
