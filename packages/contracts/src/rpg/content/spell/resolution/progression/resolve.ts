import type { RollValue } from '../../../../primitives/mechanics/roll'
import type { SpellResolutionProgressionValue } from './schema'

// ---------------------------------------------------------------------------
// Progression value resolution — locked semantics for thresholds and linear
// slot scaling. Threshold entries store resolved totals; linear increments are
// strictly positive and cumulative from the referenced base value.
// ---------------------------------------------------------------------------

/** Fill-forward: highest threshold <= level wins; otherwise base applies. */
export function resolveThresholdValueAtLevel<T extends { threshold: number }>(
  entries: readonly T[],
  level: number,
  base: SpellResolutionProgressionValue,
  getValue: (entry: T) => SpellResolutionProgressionValue,
): SpellResolutionProgressionValue {
  if (!entries.length) return base

  const applicable = entries
    .filter((entry) => entry.threshold <= level)
    .reduce<T | undefined>((best, entry) => {
      if (!best || entry.threshold > best.threshold) return entry
      return best
    }, undefined)

  return applicable ? getValue(applicable) : base
}

function scaleRollByLinearIncrement(
  base: RollValue,
  increment: RollValue,
  slotsAboveBase: number,
): RollValue {
  if (slotsAboveBase <= 0) return base

  const result: RollValue = {
    dice: base.dice ? { ...base.dice } : undefined,
    flat: base.flat,
  }

  if (increment.dice) {
    const addedCount = increment.dice.count * slotsAboveBase
    if (result.dice?.faces === increment.dice.faces) {
      result.dice = { faces: increment.dice.faces, count: result.dice.count + addedCount }
    } else if (!result.dice) {
      result.dice = { faces: increment.dice.faces, count: addedCount }
    }
  }

  if (increment.flat !== undefined) {
    result.flat = (result.flat ?? 0) + increment.flat * slotsAboveBase
  }

  return result
}

/**
 * Linear slot scaling: value(N) = base + increment × (N − spellLevel).
 * Positive-only increments are validated at parse time.
 */
export function resolveLinearValueAtSlot(
  base: SpellResolutionProgressionValue,
  increment: SpellResolutionProgressionValue,
  spellLevel: number,
  castSlotLevel: number,
): SpellResolutionProgressionValue {
  const slotsAbove = Math.max(0, castSlotLevel - spellLevel)
  if (slotsAbove === 0) return base

  if (base.kind === 'count' && increment.kind === 'count') {
    return { kind: 'count', count: base.count + increment.count * slotsAbove }
  }

  if (base.kind === 'roll' && increment.kind === 'roll') {
    return {
      kind: 'roll',
      roll: scaleRollByLinearIncrement(base.roll, increment.roll, slotsAbove),
    }
  }

  return base
}

export function resolveProgressionValueAtCharacterLevel(
  base: SpellResolutionProgressionValue,
  entries: readonly { threshold: number; value: SpellResolutionProgressionValue }[],
  characterLevel: number,
): SpellResolutionProgressionValue {
  return resolveThresholdValueAtLevel(entries, characterLevel, base, (entry) => entry.value)
}

export function resolveProgressionValueAtSlotLevel(
  base: SpellResolutionProgressionValue,
  increment: SpellResolutionProgressionValue,
  spellLevel: number,
  castSlotLevel: number,
): SpellResolutionProgressionValue {
  return resolveLinearValueAtSlot(base, increment, spellLevel, castSlotLevel)
}
