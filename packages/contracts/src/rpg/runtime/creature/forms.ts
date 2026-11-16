import type { CreatureSize } from '../../vocab/creature-size'

export type CreatureFormSizeSource = {
  overrides?: { sizes?: readonly CreatureSize[] }
}

/** Resolved sizes for the true form, or for one alternate when an override is present. */
export function resolveCreatureFormStatistics(
  base: { sizes?: readonly CreatureSize[] },
  alternate?: CreatureFormSizeSource,
): { sizes: readonly CreatureSize[] } {
  const override = alternate?.overrides?.sizes
  if (override && override.length > 0) return { sizes: override }
  return { sizes: base.sizes ?? [] }
}

export function creatureFormSizesDiffer(
  left: readonly CreatureSize[],
  right: readonly CreatureSize[],
): boolean {
  if (left.length !== right.length) return true
  const sizeSetKey = (sizes: readonly CreatureSize[]) => [...sizes].sort().join('\0')
  return sizeSetKey(left) !== sizeSetKey(right)
}
