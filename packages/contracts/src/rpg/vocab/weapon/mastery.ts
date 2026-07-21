import { vocabEnumFromEntries, keysFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

// ---------------------------------------------------------------------------
// Mastery — every SRD 5.2.1 weapon has exactly one mastery
// ---------------------------------------------------------------------------

export const WEAPON_MASTERY_TERM = {
  label: 'Weapon Mastery',
  description: 'A special property every SRD weapon has exactly one of.',
  sentence: {
    singular: 'weapon mastery',
    plural: 'weapon masteries',
  },
} as const satisfies VocabularyTerm

export const WEAPON_MASTERY_ENTRIES = {
  cleave: {
    label: 'Cleave',
    description:
      'If you hit a creature with a melee attack roll using this weapon, you can make a melee attack roll with the weapon against a second creature within 5 feet of the first that is also within your reach. On a hit, the second creature takes the weapon’s damage, but don’t add your ability modifier to that damage unless that modifier is negative. You can make this extra attack only once per turn.',
  },
  graze: {
    label: 'Graze',
    description:
      'If your attack roll with this weapon misses a creature, you can deal damage to that creature equal to the ability modifier you used to make the attack roll. This damage is the same type dealt by the weapon, and the damage can be increased only by increasing the ability modifier.',
  },
  nick: {
    label: 'Nick',
    description:
      'When you make the extra attack of the Light property, you can make it as part of the Attack action instead of as a Bonus Action. You can make this extra attack only once per turn.',
  },
  push: {
    label: 'Push',
    description:
      'If you hit a creature with this weapon, you can push the creature up to 10 feet straight away from yourself if it is Large or smaller.',
  },
  sap: {
    label: 'Sap',
    description:
      'If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.',
  },
  slow: {
    label: 'Slow',
    description:
      'If you hit a creature with this weapon and deal damage to it, you can reduce its Speed by 10 feet until the start of your next turn. If the creature is hit more than once by weapons that have this property, the Speed reduction doesn’t exceed 10 feet.',
  },
  topple: {
    label: 'Topple',
    description:
      'If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw (DC 8 plus the ability modifier used to make the attack roll and your Proficiency Bonus). On a failed save, the creature has the Prone condition.',
  },
  vex: {
    label: 'Vex',
    description:
      'If you hit a creature with this weapon and deal damage to the creature, you have Advantage on your next attack roll against that creature.',
  },
} as const satisfies Record<string, GameTermEntry>

export type WeaponMastery = keyof typeof WEAPON_MASTERY_ENTRIES

export const WEAPON_MASTERIES = keysFromEntries(WEAPON_MASTERY_ENTRIES)

export const weaponMasterySchema = vocabEnumFromEntries(WEAPON_MASTERY_ENTRIES)

/** Returns the reference entry for a mastery id, if known. */
export function getWeaponMasteryEntry(m: string): GameTermEntry | undefined {
  return WEAPON_MASTERY_ENTRIES[m as WeaponMastery]
}

/** Returns the display label for a mastery id. Falls back to the raw value. */
export function getWeaponMasteryLabel(m: string): string {
  return getWeaponMasteryEntry(m)?.label ?? m
}
