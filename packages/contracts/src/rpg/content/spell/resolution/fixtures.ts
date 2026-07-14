import type { SpellResolution } from './schema'
import { SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID } from './schema'

const CHILL_TOUCH_NO_HEAL_NOTE =
  "The target can't regain Hit Points until the end of your next turn."

/** Eldritch Blast — ranged attack, 120 ft, 1d10 force on hit. */
export const ELDRITCH_BLAST_RESOLUTION: SpellResolution = {
  target: { count: 1, kind: 'creature-or-object' },
  method: { kind: 'attack', attackType: 'ranged-spell' },
  range: { kind: 'distance', value: { value: 120, unit: 'ft' } },
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

/** Chill Touch — melee attack, reach, 1d10 necrotic on hit with no-heal rider prose. */
export const CHILL_TOUCH_RESOLUTION: SpellResolution = {
  target: { count: 1, kind: 'creature-or-object' },
  method: { kind: 'attack', attackType: 'melee-spell' },
  range: { kind: 'reach' },
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

/** Inflict Wounds — CON save, touch, 2d10 necrotic with half on successful save. */
export const INFlict_WOUNDS_RESOLUTION: SpellResolution = {
  target: { count: 1, kind: 'creature' },
  method: { kind: 'saving-throw', ability: 'con' },
  range: { kind: 'touch' },
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

export const SPELL_RESOLUTION_FIXTURES = {
  'eldritch-blast': ELDRITCH_BLAST_RESOLUTION,
  'chill-touch': CHILL_TOUCH_RESOLUTION,
  'inflict-wounds': INFlict_WOUNDS_RESOLUTION,
} as const satisfies Record<string, SpellResolution>
