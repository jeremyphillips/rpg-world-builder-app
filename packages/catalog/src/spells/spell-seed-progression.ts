/**
 * Progression seed manifest for SRD 5.2.1 catalog spells.
 *
 * Declares structured `spell.resolution.progression` for representative spells.
 * Materialize into `level-*.json` via
 * `packages/catalog/scripts/apply-spell-seed-progression.mjs`.
 */
import {
  ELDRITCH_BLAST_PROGRESSION,
  FIRE_BOLT_PROGRESSION,
  FIREBALL_PROGRESSION,
  MAGIC_MISSILE_PROGRESSION,
  type SpellResolutionProgression,
} from '@rpg/contracts'

export const SRD_521_SPELL_SEED_PROGRESSION = {
  'fire-bolt': FIRE_BOLT_PROGRESSION,
  fireball: FIREBALL_PROGRESSION,
  'magic-missile': MAGIC_MISSILE_PROGRESSION,
  'eldritch-blast': ELDRITCH_BLAST_PROGRESSION,
} as const satisfies Record<string, SpellResolutionProgression>

export const SRD_521_SPELL_SEED_PROGRESSION_SLUGS = Object.keys(
  SRD_521_SPELL_SEED_PROGRESSION,
) as (keyof typeof SRD_521_SPELL_SEED_PROGRESSION)[]

export function resolveSpellSeedProgression(slug: string): SpellResolutionProgression | undefined {
  return SRD_521_SPELL_SEED_PROGRESSION[slug as keyof typeof SRD_521_SPELL_SEED_PROGRESSION]
}
