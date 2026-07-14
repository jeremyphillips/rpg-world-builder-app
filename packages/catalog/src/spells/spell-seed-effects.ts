import { spellAtomicEffectSchema, type SpellAtomicEffect } from '@rpg/contracts'

const RULESET = 'srd-cc-5.2.1' as const

function effectId(slug: string, suffix: string): string {
  return `${RULESET}:${slug}:${suffix}`
}

/**
 * Structured atomic effects for SRD 5.2.1 seed spells that map cleanly to
 * `SPELL_ATOMIC_EFFECT_KINDS` (damage, healing, temporary hit points, projectile count).
 *
 * Spells with choice-dependent damage types, absent base values, or non-roll mechanics
 * stay prose-only until progression / application semantics land.
 */
export const SRD_521_SPELL_SEED_EFFECTS = {
  'acid-splash': [
    {
      id: effectId('acid-splash', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 1, faces: 6 } },
      damageType: 'acid',
    },
  ],
  'chill-touch': [
    {
      id: effectId('chill-touch', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 1, faces: 10 } },
      damageType: 'necrotic',
    },
  ],
  'eldritch-blast': [
    {
      id: effectId('eldritch-blast', 'beams'),
      kind: 'projectile-count',
      count: 1,
      unitLabel: 'beams',
    },
    {
      id: effectId('eldritch-blast', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 1, faces: 10 } },
      damageType: 'force',
    },
  ],
  'fire-bolt': [
    {
      id: effectId('fire-bolt', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 1, faces: 10 } },
      damageType: 'fire',
    },
  ],
  'poison-spray': [
    {
      id: effectId('poison-spray', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 1, faces: 12 } },
      damageType: 'poison',
    },
  ],
  'sacred-flame': [
    {
      id: effectId('sacred-flame', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 1, faces: 8 } },
      damageType: 'radiant',
    },
  ],
  'true-strike': [
    {
      id: effectId('true-strike', 'extra-radiant'),
      kind: 'damage',
      label: 'Extra radiant',
      roll: { flat: 0 },
      damageType: 'radiant',
    },
  ],
  'burning-hands': [
    {
      id: effectId('burning-hands', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 3, faces: 6 } },
      damageType: 'fire',
    },
  ],
  'cure-wounds': [
    {
      id: effectId('cure-wounds', 'healing'),
      kind: 'healing',
      roll: { dice: { count: 2, faces: 8 } },
    },
  ],
  'false-life': [
    {
      id: effectId('false-life', 'temporary-hit-points'),
      kind: 'temporary-hit-points',
      roll: { dice: { count: 2, faces: 4 }, flat: 4 },
    },
  ],
  'hellish-rebuke': [
    {
      id: effectId('hellish-rebuke', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 2, faces: 10 } },
      damageType: 'fire',
    },
  ],
  hex: [
    {
      id: effectId('hex', 'extra-damage'),
      kind: 'damage',
      label: 'Extra',
      roll: { dice: { count: 1, faces: 6 } },
      damageType: 'necrotic',
    },
  ],
  'hunters-mark': [
    {
      id: effectId('hunters-mark', 'extra-damage'),
      kind: 'damage',
      label: 'Extra',
      roll: { dice: { count: 1, faces: 6 } },
      damageType: 'force',
    },
  ],
  'ice-knife': [
    {
      id: effectId('ice-knife', 'piercing'),
      kind: 'damage',
      label: 'Piercing hit',
      roll: { dice: { count: 1, faces: 10 } },
      damageType: 'piercing',
    },
    {
      id: effectId('ice-knife', 'cold-burst'),
      kind: 'damage',
      label: 'Cold burst',
      roll: { dice: { count: 2, faces: 6 } },
      damageType: 'cold',
    },
  ],
  'inflict-wounds': [
    {
      id: effectId('inflict-wounds', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 2, faces: 10 } },
      damageType: 'necrotic',
    },
  ],
  'magic-missile': [
    {
      id: effectId('magic-missile', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 1, faces: 4 }, flat: 1 },
      damageType: 'force',
    },
  ],
  'ray-of-sickness': [
    {
      id: effectId('ray-of-sickness', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 2, faces: 8 } },
      damageType: 'poison',
    },
  ],
  thunderwave: [
    {
      id: effectId('thunderwave', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 2, faces: 8 } },
      damageType: 'thunder',
    },
  ],
  fireball: [
    {
      id: effectId('fireball', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 8, faces: 6 } },
      damageType: 'fire',
    },
  ],
  'mass-healing-word': [
    {
      id: effectId('mass-healing-word', 'healing'),
      kind: 'healing',
      roll: { dice: { count: 2, faces: 4 } },
    },
  ],
  'wall-of-fire': [
    {
      id: effectId('wall-of-fire', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 5, faces: 8 } },
      damageType: 'fire',
    },
  ],
  'arcane-hand': [
    {
      id: effectId('arcane-hand', 'clenched-fist'),
      kind: 'damage',
      label: 'Clenched Fist',
      roll: { dice: { count: 5, faces: 8 } },
      damageType: 'force',
    },
    {
      id: effectId('arcane-hand', 'grasping-hand-crush'),
      kind: 'damage',
      label: 'Grasping Hand crush',
      roll: { dice: { count: 4, faces: 6 } },
      damageType: 'bludgeoning',
    },
  ],
  'mass-cure-wounds': [
    {
      id: effectId('mass-cure-wounds', 'healing'),
      kind: 'healing',
      roll: { dice: { count: 5, faces: 8 } },
    },
  ],
  'delayed-blast-fireball': [
    {
      id: effectId('delayed-blast-fireball', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 12, faces: 6 } },
      damageType: 'fire',
    },
  ],
} as const satisfies Record<string, readonly SpellAtomicEffect[]>

export type Srd521SpellSeedEffectsSlug = keyof typeof SRD_521_SPELL_SEED_EFFECTS

export const SRD_521_SPELL_SEED_EFFECT_SLUGS = Object.keys(
  SRD_521_SPELL_SEED_EFFECTS,
) as Srd521SpellSeedEffectsSlug[]

/** Validates manifest entries against the contract schema at module load. */
for (const effects of Object.values(SRD_521_SPELL_SEED_EFFECTS)) {
  for (const effect of effects) {
    spellAtomicEffectSchema.parse(effect)
  }
}
