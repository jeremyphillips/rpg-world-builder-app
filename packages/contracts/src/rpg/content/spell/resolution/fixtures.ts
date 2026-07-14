import type { SpellResolution } from './schema'
import {
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  SPELL_RESOLUTION_PRIMARY_HEALING_EFFECT_ID,
  SPELL_RESOLUTION_PRIMARY_TEMPORARY_HIT_POINTS_EFFECT_ID,
} from './schema'

const CHILL_TOUCH_NO_HEAL_NOTE =
  "The target can't regain Hit Points until the end of your next turn."

/** Eldritch Blast — ranged attack, 120 ft proximity, 1d10 force on hit. */
export const ELDRITCH_BLAST_RESOLUTION: SpellResolution = {
  target: {
    count: 1,
    kind: 'creature-or-object',
    proximity: { kind: 'distance', distance: { value: 120, unit: 'ft' } },
  },
  method: { kind: 'attack', attackType: 'ranged-spell' },
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
  target: {
    count: 1,
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
  target: {
    count: 1,
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
  target: {
    count: 1,
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
  target: {
    count: 1,
    kind: 'creature',
    proximity: { kind: 'self' },
  },
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

export const SPELL_RESOLUTION_FIXTURES = {
  'eldritch-blast': ELDRITCH_BLAST_RESOLUTION,
  'chill-touch': CHILL_TOUCH_RESOLUTION,
  'inflict-wounds': INFlict_WOUNDS_RESOLUTION,
  'cure-wounds': CURE_WOUNDS_RESOLUTION,
  'false-life': FALSE_LIFE_RESOLUTION,
} as const satisfies Record<string, SpellResolution>
