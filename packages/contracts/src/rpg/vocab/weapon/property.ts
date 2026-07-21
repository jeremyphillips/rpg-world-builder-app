import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Properties — the closed SRD 5.2.1 property set
// ---------------------------------------------------------------------------

export const WEAPON_PROPERTY_TERM = {
  label: 'Weapon Property',
  description: 'A mechanical trait that modifies how a weapon works.',
  sentence: {
    singular: 'weapon property',
    plural: 'weapon properties',
  },
} as const satisfies VocabularyTerm

export const WEAPON_PROPERTY_ENTRIES = {
  ammunition: {
    label: 'Ammunition',
    description:
      'You can use a weapon that has the Ammunition property to make a ranged attack only if you have ammunition to fire from it. The type of ammunition required is specified with the weapon’s range. Each attack expends one piece of ammunition. Drawing the ammunition is part of the attack (you need a free hand to load a one-handed weapon). After a fight, you can spend 1 minute to recover half the ammunition (round down) you used in the fight; the rest is lost.',
  },
  finesse: {
    label: 'Finesse',
    description:
      'When making an attack with a Finesse weapon, use your choice of your Strength or Dexterity modifier for the attack and damage rolls. You must use the same modifier for both rolls.',
  },
  heavy: {
    label: 'Heavy',
    description:
      'You have Disadvantage on attack rolls with a Heavy weapon if it’s a Melee weapon and your Strength score isn’t at least 13 or if it’s a Ranged weapon and your Dexterity score isn’t at least 13.',
  },
  light: {
    label: 'Light',
    description:
      'When you take the Attack action on your turn and attack with a Light weapon, you can make one extra attack as a Bonus Action later on the same turn. That extra attack must be made with a different Light weapon, and you don’t add your ability modifier to the extra attack’s damage unless that modifier is negative. For example, you can attack with a Shortsword in one hand and a Dagger in the other using the Attack action and a Bonus Action, but you don’t add your Strength or Dexterity modifier to the damage roll of the Bonus Action unless that modifier is negative.',
  },
  loading: {
    label: 'Loading',
    description:
      'You can fire only one piece of ammunition from a Loading weapon when you use an action, a Bonus Action, or a Reaction to fire it, regardless of the number of attacks you can normally make.',
  },
  reach: {
    label: 'Reach',
    description:
      'A Reach weapon adds 5 feet to your reach when you attack with it, as well as when determining your reach for Opportunity Attacks with it.',
  },
  special: {
    label: 'Special',
    description:
      'A weapon with this property has unusual rules described in the Special entry for the weapon.',
  },
  thrown: {
    label: 'Thrown',
    description:
      'If a weapon has the Thrown property, you can throw the weapon to make a ranged attack, and you can draw that weapon as part of the attack. If the weapon is a Melee weapon, use the same ability modifier for the attack and damage rolls that you use for a melee attack with that weapon.',
  },
  'two-handed': {
    label: 'Two-Handed',
    description: 'A Two-Handed weapon requires two hands when you attack with it.',
  },
  versatile: {
    label: 'Versatile',
    description:
      'A Versatile weapon can be used with one or two hands. A damage value in parentheses appears with the property. The weapon deals that damage when used with two hands to make a melee attack.',
  },
} as const satisfies Record<string, GameTermEntry>

export type WeaponProperty = keyof typeof WEAPON_PROPERTY_ENTRIES

export const WEAPON_PROPERTIES = keysFromEntries(WEAPON_PROPERTY_ENTRIES)

export const weaponPropertySchema = vocabEnumFromEntries(WEAPON_PROPERTY_ENTRIES)

/** Returns the reference entry for a property id, if known. */
export function getWeaponPropertyEntry(p: string): GameTermEntry | undefined {
  return WEAPON_PROPERTY_ENTRIES[p as WeaponProperty]
}

/** Returns the display label for a property id. Falls back to the raw value. */
export function getWeaponPropertyLabel(p: string): string {
  return getWeaponPropertyEntry(p)?.label ?? p
}
