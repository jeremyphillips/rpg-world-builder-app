import {
  ELDRITCH_BLAST_RESOLUTION,
  FIREBALL_RESOLUTION,
  MAGIC_MISSILE_RESOLUTION,
} from '../fixtures'
import {
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  spellResolutionEffectIdSchema,
  type SpellResolution,
} from '../schema'
import type { SpellResolutionProgression } from './schema'

/** Fire Bolt — cantrip damage thresholds on primary damage roll. */
export const FIRE_BOLT_PROGRESSION: SpellResolutionProgression = {
  basis: 'character-level',
  tracks: [
    {
      kind: 'thresholds',
      reference: {
        subject: { kind: 'effect', effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID },
        property: 'roll',
      },
      entries: [
        { threshold: 5, value: { kind: 'roll', roll: { dice: { count: 2, faces: 10 } } } },
        { threshold: 11, value: { kind: 'roll', roll: { dice: { count: 3, faces: 10 } } } },
        { threshold: 17, value: { kind: 'roll', roll: { dice: { count: 4, faces: 10 } } } },
      ],
    },
  ],
}

/** Fireball — slot linear damage (+1d6 per slot above 3). */
export const FIREBALL_PROGRESSION: SpellResolutionProgression = {
  basis: 'spell-slot-level',
  tracks: [
    {
      kind: 'linear',
      reference: {
        subject: { kind: 'effect', effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID },
        property: 'roll',
      },
      increment: { kind: 'roll', roll: { dice: { count: 1, faces: 6 } } },
    },
  ],
}

/** Magic Missile — slot linear projectile count (+1 dart per slot above 1). */
export const MAGIC_MISSILE_PROGRESSION: SpellResolutionProgression = {
  basis: 'spell-slot-level',
  tracks: [
    {
      kind: 'linear',
      reference: {
        subject: { kind: 'application-pattern' },
        property: 'projectile-count',
      },
      increment: { kind: 'count', count: 1 },
    },
  ],
}

/**
 * Eldritch Blast — cantrip beam-count thresholds.
 * Requires `applicationPattern: projectiles` on the resolution (separate prerequisite).
 */
export const ELDRITCH_BLAST_PROGRESSION: SpellResolutionProgression = {
  basis: 'character-level',
  tracks: [
    {
      kind: 'thresholds',
      reference: {
        subject: { kind: 'application-pattern' },
        property: 'projectile-count',
      },
      entries: [
        { threshold: 5, value: { kind: 'count', count: 2 } },
        { threshold: 11, value: { kind: 'count', count: 3 } },
        { threshold: 17, value: { kind: 'count', count: 4 } },
      ],
    },
  ],
}

const BLESS_BUFF_EFFECT_ID = spellResolutionEffectIdSchema.parse('bless-buff')

/** Bless — target-count linear fixture only (not a catalog seed). */
export const BLESS_TARGET_COUNT_PROGRESSION: SpellResolutionProgression = {
  basis: 'spell-slot-level',
  tracks: [
    {
      kind: 'linear',
      reference: {
        subject: { kind: 'target' },
        property: 'selected-target-count',
      },
      increment: { kind: 'count', count: 1 },
    },
  ],
}

/** Minimal Bless resolution for progression fixture tests — core buff remains prose-only. */
export const BLESS_PROGRESSION_FIXTURE_RESOLUTION: SpellResolution = {
  selectionMode: 'targets',
  target: {
    count: 3,
    countKind: 'up-to',
    kind: 'creature',
    proximity: { kind: 'distance', distance: { value: 30, unit: 'ft' } },
  },
  method: { kind: 'automatic' },
  effects: [
    {
      id: BLESS_BUFF_EFFECT_ID,
      kind: 'healing',
      roll: { flat: 0 },
    },
  ],
  outcomes: [
    {
      result: 'applied',
      note: 'Targets gain +1d4 to attack rolls and saving throws.',
      applications: [],
    },
  ],
}

/** @deprecated Use {@link ELDRITCH_BLAST_RESOLUTION} — projectiles are on the canonical fixture. */
export const ELDRITCH_BLAST_WITH_PROJECTILES_RESOLUTION = ELDRITCH_BLAST_RESOLUTION

export const SPELL_RESOLUTION_PROGRESSION_FIXTURES = {
  'fire-bolt': {
    resolution: {
      selectionMode: 'targets',
      target: {
        count: 1,
        countKind: 'exact',
        kind: 'creature-or-object',
        proximity: { kind: 'distance', distance: { value: 120, unit: 'ft' } },
      },
      method: { kind: 'attack', attackType: 'ranged-spell' },
      effects: [
        {
          id: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
          kind: 'damage',
          roll: { dice: { count: 1, faces: 10 } },
          damageType: 'fire',
        },
      ],
      outcomes: [
        {
          result: 'hit',
          applications: [{ effectId: SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID, amount: 'full' }],
        },
      ],
    } satisfies SpellResolution,
    progression: FIRE_BOLT_PROGRESSION,
    spellLevel: 0,
  },
  fireball: {
    resolution: FIREBALL_RESOLUTION,
    progression: FIREBALL_PROGRESSION,
    spellLevel: 3,
  },
  'magic-missile': {
    resolution: MAGIC_MISSILE_RESOLUTION,
    progression: MAGIC_MISSILE_PROGRESSION,
    spellLevel: 1,
  },
  'eldritch-blast': {
    resolution: ELDRITCH_BLAST_RESOLUTION,
    progression: ELDRITCH_BLAST_PROGRESSION,
    spellLevel: 0,
  },
  bless: {
    resolution: BLESS_PROGRESSION_FIXTURE_RESOLUTION,
    progression: BLESS_TARGET_COUNT_PROGRESSION,
    spellLevel: 1,
  },
} as const
