/**
 * Primary-effect parity checks for resolution catalog seeds.
 *
 * Compares each `spell.resolution.effects[]` entry against a matching root
 * `effects[]` row (roll, damage type, or kind). Consumed by catalog tests to
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

function issue(slug: string, message: string): ResolutionEffectParityIssue {
  return { slug, message }
}

function rollsMatch(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function atomicEffectsMatchResolution(
  atomic: SpellAtomicEffect,
  resolutionEffect: SpellResolutionEffect,
): boolean {
  if (atomic.kind !== resolutionEffect.kind) return false

  if (!rollsMatch(atomic.roll, resolutionEffect.roll)) return false

  if (atomic.kind === 'damage' && resolutionEffect.kind === 'damage') {
    return atomic.damageType === resolutionEffect.damageType
  }

  return true
}

function findMatchingAtomicEffect(
  atomicEffects: readonly SpellAtomicEffect[] | null | undefined,
  resolutionEffect: SpellResolutionEffect,
): SpellAtomicEffect | undefined {
  if (!atomicEffects?.length) return undefined

  return atomicEffects.find((atomic) => atomicEffectsMatchResolution(atomic, resolutionEffect))
}

function compareDamageParity(
  slug: string,
  atomic: SpellAtomicEffect,
  resolutionEffect: SpellResolutionEffect,
): ResolutionEffectParityIssue[] {
  if (atomic.kind !== 'damage' || resolutionEffect.kind !== 'damage') return []

  const issues: ResolutionEffectParityIssue[] = []
  if (!rollsMatch(atomic.roll, resolutionEffect.roll)) {
    issues.push(issue(slug, 'Resolution damage roll diverges from matching atomic damage roll.'))
  }
  if (atomic.damageType !== resolutionEffect.damageType) {
    issues.push(issue(slug, 'Resolution damage type diverges from matching atomic damage type.'))
  }
  return issues
}

function compareRollOnlyParity(
  slug: string,
  atomic: SpellAtomicEffect,
  resolutionEffect: SpellResolutionEffect,
  kind: 'healing' | 'temporary-hit-points',
): ResolutionEffectParityIssue[] {
  if (atomic.kind !== kind || resolutionEffect.kind !== kind) return []
  if (rollsMatch(atomic.roll, resolutionEffect.roll)) return []

  return [issue(slug, `Resolution ${kind} roll diverges from matching atomic roll.`)]
}

function compareMatchedKindParity(
  slug: string,
  atomic: SpellAtomicEffect,
  resolutionEffect: SpellResolutionEffect,
): ResolutionEffectParityIssue[] {
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
      return compareDamageParity(slug, atomic, resolutionEffect)
    case 'healing':
      return compareRollOnlyParity(slug, atomic, resolutionEffect, 'healing')
    case 'temporary-hit-points':
      return compareRollOnlyParity(slug, atomic, resolutionEffect, 'temporary-hit-points')
    default:
      return []
  }
}

function compareResolutionEffectParity(
  spell: Spell,
  resolutionEffect: SpellResolutionEffect,
): ResolutionEffectParityIssue[] {
  const atomic = findMatchingAtomicEffect(spell.effects, resolutionEffect)
  if (!atomic) {
    return [
      issue(
        spell.slug,
        `No matching root atomic effect for resolution effect ${resolutionEffect.id} (${resolutionEffect.kind}).`,
      ),
    ]
  }

  return compareMatchedKindParity(spell.slug, atomic, resolutionEffect)
}

/** Compares seeded resolution.effects[] against matching root atomic effects. */
export function findResolutionEffectParityIssues(spell: Spell): ResolutionEffectParityIssue[] {
  if (!spell.resolution?.effects.length) return []

  return spell.resolution.effects.flatMap((resolutionEffect) =>
    compareResolutionEffectParity(spell, resolutionEffect),
  )
}

/** @deprecated Use findResolutionEffectParityIssues — kept for primary-only call sites. */
export function findPrimaryResolutionEffectParityIssues(
  spell: Spell,
): ResolutionEffectParityIssue[] {
  const atomic = findPrimaryResolutionEffect(spell.effects)
  const resolutionEffect = spell.resolution?.effects[0]
  if (!spell.resolution || !atomic || !resolutionEffect) return []

  return compareMatchedKindParity(spell.slug, atomic, resolutionEffect)
}

/** Audits every applicable resolution seed for effect parity. */
export function findResolutionSeedParityIssues(
  spells: readonly Spell[],
): ResolutionEffectParityIssue[] {
  return spells.flatMap((spell) => findResolutionEffectParityIssues(spell))
}
