import type { SpellAtomicEffect } from '@rpg/contracts'

/** Test/story fixtures only — not catalog seed data. */
export const SPELL_EFFECT_FIXTURES = {
  fireBolt: [
    {
      id: 'fx-fire-bolt',
      kind: 'damage',
      roll: { dice: { count: 1, faces: 10 } },
      damageType: 'fire',
    },
  ],
  fireball: [
    {
      id: 'fx-fireball',
      kind: 'damage',
      roll: { dice: { count: 8, faces: 6 } },
      damageType: 'fire',
    },
  ],
  cureWounds: [
    {
      id: 'fx-cure-wounds',
      kind: 'healing',
      roll: { dice: { count: 2, faces: 8 } },
    },
  ],
  falseLife: [
    {
      id: 'fx-false-life',
      kind: 'temporary-hit-points',
      roll: { dice: { count: 2, faces: 4 }, flat: 4 },
    },
  ],
  magicMissile: [
    {
      id: 'fx-magic-missile-count',
      kind: 'projectile-count',
      count: 3,
      label: 'darts',
    },
    {
      id: 'fx-magic-missile-damage',
      kind: 'damage',
      roll: { dice: { count: 1, faces: 4 }, flat: 1 },
      damageType: 'force',
    },
  ],
} as const satisfies Record<string, readonly SpellAtomicEffect[]>

export const SPELL_EFFECT_DISPLAY_EXPECTATIONS = {
  fireBolt: ['1d10 Fire damage'],
  fireball: ['8d6 Fire damage'],
  cureWounds: ['2d8 healing'],
  falseLife: ['2d4+4 temporary Hit Points'],
  magicMissile: ['3 darts', '1d4+1 Force damage'],
} as const satisfies Record<keyof typeof SPELL_EFFECT_FIXTURES, readonly string[]>
