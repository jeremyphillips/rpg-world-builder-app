import { spellAtomicEffectSchema, type SpellAtomicEffect } from '@rpg/contracts'

function derivationEffectId(slug: string, suffix: string): string {
  return `derivation:${slug}:${suffix}`
}

/**
 * Primary atomic effects for derived resolution manifest entries.
 *
 * Used only by `deriveResolutionFromSpell()` when applying `kind: 'derived'` rows
 * in `spell-seed-resolution.ts`. Full-resolution spells use contract fixtures instead.
 */
export const SRD_521_SPELL_RESOLUTION_DERIVATION_EFFECTS = {
  'acid-splash': [
    {
      id: derivationEffectId('acid-splash', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 1, faces: 6 } },
      damageType: 'acid',
    },
  ],
  'burning-hands': [
    {
      id: derivationEffectId('burning-hands', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 3, faces: 6 } },
      damageType: 'fire',
    },
  ],
  'cure-wounds': [
    {
      id: derivationEffectId('cure-wounds', 'healing'),
      kind: 'healing',
      roll: { dice: { count: 2, faces: 8 } },
    },
  ],
  'delayed-blast-fireball': [
    {
      id: derivationEffectId('delayed-blast-fireball', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 12, faces: 6 } },
      damageType: 'fire',
    },
  ],
  'false-life': [
    {
      id: derivationEffectId('false-life', 'temporary-hit-points'),
      kind: 'temporary-hit-points',
      roll: { dice: { count: 2, faces: 4 }, flat: 4 },
    },
  ],
  fireball: [
    {
      id: derivationEffectId('fireball', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 8, faces: 6 } },
      damageType: 'fire',
    },
  ],
  'fire-bolt': [
    {
      id: derivationEffectId('fire-bolt', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 1, faces: 10 } },
      damageType: 'fire',
    },
  ],
  'hellish-rebuke': [
    {
      id: derivationEffectId('hellish-rebuke', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 2, faces: 10 } },
      damageType: 'fire',
    },
  ],
  'mass-cure-wounds': [
    {
      id: derivationEffectId('mass-cure-wounds', 'healing'),
      kind: 'healing',
      roll: { dice: { count: 5, faces: 8 } },
    },
  ],
  'mass-healing-word': [
    {
      id: derivationEffectId('mass-healing-word', 'healing'),
      kind: 'healing',
      roll: { dice: { count: 2, faces: 4 } },
    },
  ],
  'poison-spray': [
    {
      id: derivationEffectId('poison-spray', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 1, faces: 12 } },
      damageType: 'poison',
    },
  ],
  'ray-of-sickness': [
    {
      id: derivationEffectId('ray-of-sickness', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 2, faces: 8 } },
      damageType: 'poison',
    },
  ],
  'sacred-flame': [
    {
      id: derivationEffectId('sacred-flame', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 1, faces: 8 } },
      damageType: 'radiant',
    },
  ],
  thunderwave: [
    {
      id: derivationEffectId('thunderwave', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 2, faces: 8 } },
      damageType: 'thunder',
    },
  ],
  'wall-of-fire': [
    {
      id: derivationEffectId('wall-of-fire', 'damage'),
      kind: 'damage',
      roll: { dice: { count: 5, faces: 8 } },
      damageType: 'fire',
    },
  ],
} as const satisfies Record<string, readonly SpellAtomicEffect[]>

export type Srd521SpellResolutionDerivationEffectsSlug =
  keyof typeof SRD_521_SPELL_RESOLUTION_DERIVATION_EFFECTS

for (const effects of Object.values(SRD_521_SPELL_RESOLUTION_DERIVATION_EFFECTS)) {
  for (const effect of effects) {
    spellAtomicEffectSchema.parse(effect)
  }
}
