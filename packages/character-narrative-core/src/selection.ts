import type {
  NarrativeFragment,
  NarrativeGenerationContext,
  NarrativeTheme,
} from '@rpg/contracts/character-narrative'

export function createNarrativeRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = Math.imul(state ^ (state >>> 15), state | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function pickWeighted<T>(
  values: readonly T[],
  weight: (value: T) => number,
  random: () => number,
): T | undefined {
  let remaining = random() * values.reduce((sum, value) => sum + weight(value), 0)
  return (
    values.find((value) => {
      remaining -= weight(value)
      return remaining < 0
    }) ?? values.at(-1)
  )
}

export function isFragmentEligible(
  fragment: NarrativeFragment,
  context: NarrativeGenerationContext,
  theme: NarrativeTheme,
): boolean {
  return (
    fragment.themeIds.includes(theme) &&
    (!fragment.alignmentIds ||
      (context.alignment !== undefined && fragment.alignmentIds.includes(context.alignment))) &&
    fragment.requires.every((token) => Boolean(context.tokens[token])) &&
    fragment.conditions.every((condition) => context.boundConditions.includes(condition))
  )
}

export function fragmentWeight(
  fragment: NarrativeFragment,
  context: NarrativeGenerationContext,
): number {
  const affinity = fragment.affinities.filter((value) => context.affinities.includes(value)).length
  return fragment.weight * (1 + affinity * 4 + (fragment.alignmentIds ? 12 : 0))
}
