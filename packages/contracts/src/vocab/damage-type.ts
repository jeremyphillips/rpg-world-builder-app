import { z } from 'zod'

import type { GameTermEntry } from './vocab/types'

// ---------------------------------------------------------------------------
// Damage types — the closed SRD 5.2.1 set, shared by weapons, spells, monster
// actions, and species grants (resistances, draconic/giant damage choices).
//
// This map is the single source of truth: keys drive validation (`z.enum`) and
// the `category` field groups the set (physical / elemental / planar) without a
// parallel array that could drift. "No damage type" is modeled by field
// absence (`damageTypeSchema.optional()`), never a `'none'` member.
// ---------------------------------------------------------------------------

export const DAMAGE_CATEGORIES = ['physical', 'elemental', 'planar'] as const

export type DamageCategory = (typeof DAMAGE_CATEGORIES)[number]

type DamageTypeEntry = GameTermEntry & { readonly category: DamageCategory }

export const DAMAGE_TYPE_ENTRIES = {
  bludgeoning: {
    category: 'physical',
    label: 'Bludgeoning',
    description:
      'Bludgeoning damage is delivered by a blunt instrument or a blow, fall, or constriction that doesn’t use a cutting or piercing point.',
  },
  piercing: {
    category: 'physical',
    label: 'Piercing',
    description:
      'Piercing damage is delivered by a strike that uses a point, such as a fang, arrow, or rapier.',
  },
  slashing: {
    category: 'physical',
    label: 'Slashing',
    description:
      'Slashing damage is delivered by a cut from a sharp edge, such as an axe, claw, or greatsword.',
  },
  fire: {
    category: 'elemental',
    label: 'Fire',
    description:
      'Fire damage is delivered by heat and flame, whether mundane or magical (e.g. red dragon breath, Fire Bolt).',
  },
  cold: {
    category: 'elemental',
    label: 'Cold',
    description:
      'Cold damage is delivered by ice, freezing vapor, and other numbing, frostbite-inducing effects.',
  },
  acid: {
    category: 'elemental',
    label: 'Acid',
    description:
      'Acid damage is delivered by corrosive substances and dissolving attacks (e.g. black dragon breath, some oozes).',
  },
  lightning: {
    category: 'elemental',
    label: 'Lightning',
    description:
      'Lightning damage is delivered by raw electrical energy (e.g. blue dragon breath, Lightning Bolt).',
  },
  thunder: {
    category: 'elemental',
    label: 'Thunder',
    description:
      'Thunder damage is delivered by concussive sound and vibratory force (e.g. Thunderwave).',
  },
  poison: {
    category: 'elemental',
    label: 'Poison',
    description:
      'Poison damage is delivered by venom, toxic gas, and other caustic or biological toxins.',
  },
  radiant: {
    category: 'planar',
    label: 'Radiant',
    description:
      'Radiant damage is searing light and holy or celestial power (e.g. Moonbeam, a deva’s weapon).',
  },
  necrotic: {
    category: 'planar',
    label: 'Necrotic',
    description:
      'Necrotic damage withers life, flesh, and souls—often from undeath, decay, or void-like magic.',
  },
  force: {
    category: 'planar',
    label: 'Force',
    description:
      'Force damage is pure magical energy, forming invisible walls and unerring blasts (e.g. Magic Missile).',
  },
  psychic: {
    category: 'planar',
    label: 'Psychic',
    description:
      'Psychic damage assails the mind, emotions, and sanity (e.g. mind flayer attacks, Dissonant Whispers).',
  },
} as const satisfies Record<string, DamageTypeEntry>

export type DamageType = keyof typeof DAMAGE_TYPE_ENTRIES

export const DAMAGE_TYPE_IDS = Object.keys(DAMAGE_TYPE_ENTRIES) as [DamageType, ...DamageType[]]

export const damageTypeSchema = z.enum(DAMAGE_TYPE_IDS)

/** The damage type ids belonging to a given category, narrowed at the type level. */
export type DamageTypeByCategory<C extends DamageCategory> = {
  [K in DamageType]: (typeof DAMAGE_TYPE_ENTRIES)[K]['category'] extends C ? K : never
}[DamageType]

export type PhysicalDamageType = DamageTypeByCategory<'physical'>

/**
 * The physical-only subset, derived from the map so the weapon damage taxonomy
 * never drifts from this source of truth. A non-empty tuple so it can feed
 * `z.enum` directly (see `weapon.ts`).
 */
export const PHYSICAL_DAMAGE_TYPE_IDS = DAMAGE_TYPE_IDS.filter(
  (id): id is PhysicalDamageType => DAMAGE_TYPE_ENTRIES[id].category === 'physical',
) as [PhysicalDamageType, ...PhysicalDamageType[]]

/** Returns the damage type ids in a category (e.g. all elemental types). */
export function damageTypeIdsByCategory<C extends DamageCategory>(
  category: C,
): DamageTypeByCategory<C>[] {
  return DAMAGE_TYPE_IDS.filter(
    (id): id is DamageTypeByCategory<C> => DAMAGE_TYPE_ENTRIES[id].category === category,
  )
}

/** Returns the reference entry for a damage type id, if known. */
export function getDamageTypeEntry(id: string): DamageTypeEntry | undefined {
  return DAMAGE_TYPE_ENTRIES[id as DamageType]
}

/** Returns the display label for a damage type id. Falls back to the raw value. */
export function getDamageTypeLabel(id: string): string {
  return getDamageTypeEntry(id)?.label ?? id
}
