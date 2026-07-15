import type { SpellResolution } from './schema'
import {
  spellResolutionEffectIdSchema,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID,
  SPELL_RESOLUTION_PRIMARY_TEMPORARY_HIT_POINTS_EFFECT_ID,
} from './schema'

const CHILL_TOUCH_NO_HEAL_NOTE =
  "The target can't regain Hit Points until the end of your next turn."

const ICE_KNIFE_PIERCING_EFFECT_ID = spellResolutionEffectIdSchema.parse('piercing')
const ICE_KNIFE_COLD_BURST_EFFECT_ID = spellResolutionEffectIdSchema.parse('cold-burst')

const ARCANE_HAND_CLENCHED_FIST_EFFECT_ID = spellResolutionEffectIdSchema.parse('clenched-fist')
const ARCANE_HAND_GRASPING_HAND_EFFECT_ID =
  spellResolutionEffectIdSchema.parse('grasping-hand-crush')

/** Eldritch Blast — ranged attack, 120 ft proximity, 1 beam dealing 1d10 force on hit. */
export const ELDRITCH_BLAST_RESOLUTION: SpellResolution = {
  selectionMode: 'targets',
  target: {
    count: 1,
    countKind: 'exact',
    kind: 'creature-or-object',
    proximity: { kind: 'distance', distance: { value: 120, unit: 'ft' } },
  },
  method: { kind: 'attack', attackType: 'ranged-spell' },
  applicationPattern: {
    kind: 'projectiles',
    count: { type: 'fixed', value: 1 },
    unitLabel: { singular: 'beam', plural: 'beams' },
    applicationMode: 'per-projectile',
  },
  effects: [
    {
      id: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
      kind: 'damage',
      roll: { dice: { count: 1, faces: 10 } },
      damageType: 'force',
    },
  ],
  outcomes: [
    {
      result: 'hit',
      applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
    },
  ],
}

/** Chill Touch — melee attack, reach proximity, 1d10 necrotic on hit with no-heal rider prose. */
export const CHILL_TOUCH_RESOLUTION: SpellResolution = {
  selectionMode: 'targets',
  target: {
    count: 1,
    countKind: 'exact',
    kind: 'creature-or-object',
    proximity: { kind: 'reach' },
  },
  method: { kind: 'attack', attackType: 'melee-spell' },
  effects: [
    {
      id: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
      kind: 'damage',
      roll: { dice: { count: 1, faces: 10 } },
      damageType: 'necrotic',
    },
  ],
  outcomes: [
    {
      result: 'hit',
      applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
      note: CHILL_TOUCH_NO_HEAL_NOTE,
    },
  ],
}

/** Inflict Wounds — CON save, touch proximity, 2d10 necrotic with half on successful save. */
export const INFlict_WOUNDS_RESOLUTION: SpellResolution = {
  selectionMode: 'targets',
  target: {
    count: 1,
    countKind: 'exact',
    kind: 'creature',
    proximity: { kind: 'touch' },
  },
  method: { kind: 'saving-throw', ability: 'con' },
  effects: [
    {
      id: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
      kind: 'damage',
      roll: { dice: { count: 2, faces: 10 } },
      damageType: 'necrotic',
    },
  ],
  outcomes: [
    {
      result: 'failed-save',
      applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
    },
    {
      result: 'successful-save',
      applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'half' }],
    },
  ],
}

/** Cure Wounds — automatic touch healing for one creature. */
export const CURE_WOUNDS_RESOLUTION: SpellResolution = {
  selectionMode: 'targets',
  target: {
    count: 1,
    countKind: 'exact',
    kind: 'creature',
    proximity: { kind: 'touch' },
  },
  method: { kind: 'automatic' },
  effects: [
    {
      id: SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID,
      kind: 'healing',
      roll: { dice: { count: 2, faces: 8 } },
    },
  ],
  outcomes: [
    {
      result: 'applied',
      applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID, amount: 'full' }],
    },
  ],
}

/** False Life — automatic self temporary hit points. */
export const FALSE_LIFE_RESOLUTION: SpellResolution = {
  selectionMode: 'self',
  method: { kind: 'automatic' },
  effects: [
    {
      id: SPELL_RESOLUTION_PRIMARY_TEMPORARY_HIT_POINTS_EFFECT_ID,
      kind: 'temporary-hit-points',
      roll: { dice: { count: 2, faces: 4 }, flat: 4 },
    },
  ],
  outcomes: [
    {
      result: 'applied',
      applications: [
        { effectId: SPELL_RESOLUTION_PRIMARY_TEMPORARY_HIT_POINTS_EFFECT_ID, amount: 'full' },
      ],
    },
  ],
}

/** Fireball — point origin with sphere area and DEX save damage. */
export const FIREBALL_RESOLUTION: SpellResolution = {
  selectionMode: 'point',
  origin: {
    proximity: { kind: 'distance', distance: { value: 150, unit: 'ft' } },
  },
  areaOfEffect: { shape: 'sphere', radius: { value: 20, unit: 'ft' } },
  method: { kind: 'saving-throw', ability: 'dex' },
  effects: [
    {
      id: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
      kind: 'damage',
      roll: { dice: { count: 8, faces: 6 } },
      damageType: 'fire',
    },
  ],
  outcomes: [
    {
      result: 'failed-save',
      applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
    },
    {
      result: 'successful-save',
      applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'half' }],
    },
  ],
}

/** Burning Hands — caster-origin cone with DEX save damage. */
export const BURNING_HANDS_RESOLUTION: SpellResolution = {
  selectionMode: 'self',
  areaOfEffect: { shape: 'cone', length: { value: 15, unit: 'ft' } },
  method: { kind: 'saving-throw', ability: 'dex' },
  effects: [
    {
      id: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
      kind: 'damage',
      roll: { dice: { count: 3, faces: 6 } },
      damageType: 'fire',
    },
  ],
  outcomes: [
    {
      result: 'failed-save',
      applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
    },
    {
      result: 'successful-save',
      applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'half' }],
    },
  ],
}

/** Ice Knife — ranged attack piercing on hit; cold burst modeled as a second damage effect. */
export const ICE_KNIFE_RESOLUTION: SpellResolution = {
  selectionMode: 'targets',
  target: {
    count: 1,
    countKind: 'exact',
    kind: 'creature',
    proximity: { kind: 'distance', distance: { value: 60, unit: 'ft' } },
  },
  method: { kind: 'attack', attackType: 'ranged-spell' },
  effects: [
    {
      id: ICE_KNIFE_PIERCING_EFFECT_ID,
      kind: 'damage',
      roll: { dice: { count: 1, faces: 10 } },
      damageType: 'piercing',
    },
    {
      id: ICE_KNIFE_COLD_BURST_EFFECT_ID,
      kind: 'damage',
      roll: { dice: { count: 2, faces: 6 } },
      damageType: 'cold',
    },
  ],
  outcomes: [
    {
      result: 'hit',
      applications: [{ effectId: ICE_KNIFE_PIERCING_EFFECT_ID, amount: 'full' }],
      note: 'Hit or miss, the shard explodes: each creature within 5 feet makes a Dexterity saving throw or takes the cold burst damage.',
    },
  ],
}

/** Arcane Hand — melee attack with choice-dependent damage effects. */
export const ARCANE_HAND_RESOLUTION: SpellResolution = {
  selectionMode: 'targets',
  target: {
    count: 1,
    countKind: 'exact',
    kind: 'creature',
    proximity: { kind: 'distance', distance: { value: 120, unit: 'ft' } },
  },
  method: { kind: 'attack', attackType: 'melee-spell' },
  effects: [
    {
      id: ARCANE_HAND_CLENCHED_FIST_EFFECT_ID,
      kind: 'damage',
      roll: { dice: { count: 5, faces: 8 } },
      damageType: 'force',
    },
    {
      id: ARCANE_HAND_GRASPING_HAND_EFFECT_ID,
      kind: 'damage',
      roll: { dice: { count: 4, faces: 6 } },
      damageType: 'bludgeoning',
    },
  ],
  outcomes: [
    {
      result: 'hit',
      note: 'Choose Clenched Fist or Grasping Hand crush when commanding the hand; apply the matching effect on a hit.',
      applications: [],
    },
  ],
}

/** Mass Healing Word — up to six creatures at distance with automatic healing. */
export const MASS_HEALING_WORD_RESOLUTION: SpellResolution = {
  selectionMode: 'targets',
  target: {
    count: 6,
    countKind: 'up-to',
    kind: 'creature',
    proximity: { kind: 'distance', distance: { value: 60, unit: 'ft' } },
  },
  method: { kind: 'automatic' },
  effects: [
    {
      id: SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID,
      kind: 'healing',
      roll: { dice: { count: 2, faces: 4 } },
    },
  ],
  outcomes: [
    {
      result: 'applied',
      applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID, amount: 'full' }],
    },
  ],
}

/** Magic Missile — automatic force darts with per-projectile damage. */
export const MAGIC_MISSILE_RESOLUTION: SpellResolution = {
  selectionMode: 'targets',
  target: {
    count: 1,
    countKind: 'exact',
    kind: 'creature',
    proximity: { kind: 'distance', distance: { value: 120, unit: 'ft' } },
  },
  method: { kind: 'automatic' },
  applicationPattern: {
    kind: 'projectiles',
    count: { type: 'fixed', value: 3 },
    unitLabel: { singular: 'dart', plural: 'darts' },
    applicationMode: 'per-projectile',
  },
  effects: [
    {
      id: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
      kind: 'damage',
      roll: { dice: { count: 1, faces: 4 }, flat: 1 },
      damageType: 'force',
    },
  ],
  outcomes: [
    {
      result: 'applied',
      applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
    },
  ],
}

export const SPELL_RESOLUTION_FIXTURES = {
  'eldritch-blast': ELDRITCH_BLAST_RESOLUTION,
  'chill-touch': CHILL_TOUCH_RESOLUTION,
  'inflict-wounds': INFlict_WOUNDS_RESOLUTION,
  'cure-wounds': CURE_WOUNDS_RESOLUTION,
  'false-life': FALSE_LIFE_RESOLUTION,
  fireball: FIREBALL_RESOLUTION,
  'burning-hands': BURNING_HANDS_RESOLUTION,
  'mass-healing-word': MASS_HEALING_WORD_RESOLUTION,
  'ice-knife': ICE_KNIFE_RESOLUTION,
  'arcane-hand': ARCANE_HAND_RESOLUTION,
  'magic-missile': MAGIC_MISSILE_RESOLUTION,
} as const satisfies Record<string, SpellResolution>
