/**
 * Primary-effect parity checks for resolution catalog seeds.
 *
 * Compares `spell.resolution.effects[0]` against the primary unlabeled entry in
 * root `effects[]` (roll, damage type, or kind). Consumed by catalog tests to
 * catch manifest/apply drift without hand-maintaining per-spell assertions.
 *
 * Temporary migration guardrail — intended for seed validation, not runtime use.
 */
import type { Spell, SpellAtomicEffect, SpellResolutionEffect } from '@rpg/contracts'

import { findPrimaryResolutionEffect } from './derive-resolution-from-spell'

export type ResolutionEffectParityIssue = {
  slug: string
  message: string
}

type ParityPair = {
  slug: string
  atomic: SpellAtomicEffect
  resolutionEffect: SpellResolutionEffect
}

function issue(slug: string, message: string): ResolutionEffectParityIssue {
  return { slug, message }
}

function rollsMatch(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function parityPair(spell: Spell): ParityPair | undefined {
  const atomic = findPrimaryResolutionEffect(spell.effects)
  const resolutionEffect = spell.resolution?.effects[0]
  if (!spell.resolution || !atomic || !resolutionEffect) return undefined
  return { slug: spell.slug, atomic, resolutionEffect }
}

function compareDamageParity({
  slug,
  atomic,
  resolutionEffect,
}: ParityPair): ResolutionEffectParityIssue[] {
  if (atomic.kind !== 'damage' || resolutionEffect.kind !== 'damage') return []

  const issues: ResolutionEffectParityIssue[] = []
  if (!rollsMatch(atomic.roll, resolutionEffect.roll)) {
    issues.push(issue(slug, 'Resolution damage roll diverges from primary atomic damage roll.'))
  }
  if (atomic.damageType !== resolutionEffect.damageType) {
    issues.push(issue(slug, 'Resolution damage type diverges from primary atomic damage type.'))
  }
  return issues
}

function compareRollOnlyParity(
  pair: ParityPair,
  kind: 'healing' | 'temporary-hit-points',
): ResolutionEffectParityIssue[] {
  const { slug, atomic, resolutionEffect } = pair
  if (atomic.kind !== kind || resolutionEffect.kind !== kind) return []
  if (rollsMatch(atomic.roll, resolutionEffect.roll)) return []

  return [issue(slug, `Resolution ${kind} roll diverges from primary atomic roll.`)]
}

function compareMatchedKindParity(pair: ParityPair): ResolutionEffectParityIssue[] {
  const { slug, atomic, resolutionEffect } = pair

  if (atomic.kind !== resolutionEffect.kind) {
    return [
      issue(
        slug,
        `Resolution effect kind ${resolutionEffect.kind} does not match atomic kind ${atomic.kind}.`,
      ),
    ]
  }

  switch (atomic.kind) {
    case 'damage':
      return compareDamageParity(pair)
    case 'healing':
      return compareRollOnlyParity(pair, 'healing')
    case 'temporary-hit-points':
      return compareRollOnlyParity(pair, 'temporary-hit-points')
    default:
      return []
  }
}

/** Compares seeded resolution.effects[0] against the primary root atomic effect. */
export function findResolutionEffectParityIssues(spell: Spell): ResolutionEffectParityIssue[] {
  const pair = parityPair(spell)
  return pair ? compareMatchedKindParity(pair) : []
}

/** Audits every applicable resolution seed for primary-effect parity. */
export function findResolutionSeedParityIssues(
  spells: readonly Spell[],
): ResolutionEffectParityIssue[] {
  return spells.flatMap((spell) => findResolutionEffectParityIssues(spell))
}
