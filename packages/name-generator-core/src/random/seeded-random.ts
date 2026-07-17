// ---------------------------------------------------------------------------
// Mulberry32 PRNG — deterministic, seedable, no external dependencies.
// ---------------------------------------------------------------------------

export type SeededRandom = {
  next: () => number
  nextInt: (max: number) => number
}

export function createMulberry32(seed: number): SeededRandom {
  let state = seed >>> 0

  return {
    next(): number {
      state += 0x6d2b79f5
      let t = state
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
    nextInt(max: number): number {
      if (max <= 0) {
        throw new Error('max must be positive')
      }
      return Math.floor(this.next() * max)
    },
  }
}
