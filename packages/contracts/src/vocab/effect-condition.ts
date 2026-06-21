import { z } from 'zod'

import type { GameTermEntry } from './types'

// ---------------------------------------------------------------------------
// Effect conditions — the closed SRD 5.2.1 condition set. Used by spell tags
// and (future) creature/encounter surfaces. Stripped to id + label + rules text.
// ---------------------------------------------------------------------------

export const EFFECT_CONDITION_ENTRIES = {
  blinded: {
    label: 'Blinded',
    description:
      "A blinded creature can't see and automatically fails ability checks that require sight. Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.",
  },
  charmed: {
    label: 'Charmed',
    description:
      "A charmed creature can't attack the charmer or target the charmer with harmful abilities. The charmer has advantage on social checks against the creature.",
  },
  deafened: {
    label: 'Deafened',
    description:
      "A deafened creature can't hear and automatically fails ability checks that require hearing.",
  },
  frightened: {
    label: 'Frightened',
    description:
      'A frightened creature has disadvantage on ability checks and attack rolls while the source of fear is in line of sight. The creature cannot willingly move closer to that source.',
  },
  grappled: {
    label: 'Grappled',
    description:
      "A grappled creature's speed becomes 0, and it can't benefit from any bonus to speed. The condition ends if the grappler is incapacitated or if an effect removes the grappled creature from the grappler's reach.",
  },
  incapacitated: {
    label: 'Incapacitated',
    description: "An incapacitated creature can't take actions or reactions.",
  },
  invisible: {
    label: 'Invisible',
    description:
      'An invisible creature is impossible to see without special senses; attack rolls against it have disadvantage, and its attack rolls have advantage. It is still revealed by noise, tracks, etc.',
  },
  paralyzed: {
    label: 'Paralyzed',
    description:
      "A paralyzed creature is incapacitated and can't move or speak. It automatically fails Strength and Dexterity saving throws. Attack rolls against it have advantage; melee hits from 5 feet are critical hits.",
  },
  petrified: {
    label: 'Petrified',
    description:
      'A petrified creature is transformed to stone, weighs 10× as much, and is incapacitated. It has resistance to all damage and immunity to poison and disease. Attack rolls against it have advantage.',
  },
  poisoned: {
    label: 'Poisoned',
    description: 'A poisoned creature has disadvantage on attack rolls and ability checks.',
  },
  prone: {
    label: 'Prone',
    description:
      'A prone creature can only crawl unless it stands, ending the condition. Melee attacks against it have advantage; ranged attacks have disadvantage. Its own attacks have disadvantage unless it stands.',
  },
  restrained: {
    label: 'Restrained',
    description:
      "A restrained creature's speed is 0; attack rolls against it have advantage, and it has disadvantage on Dexterity saving throws.",
  },
  stunned: {
    label: 'Stunned',
    description:
      "A stunned creature is incapacitated, can't move, and can speak only falteringly. It automatically fails Strength and Dexterity saving throws; attack rolls against it have advantage.",
  },
  unconscious: {
    label: 'Unconscious',
    description:
      "An unconscious creature is incapacitated, can't move or speak, and is unaware of its surroundings. It drops what it's holding and falls prone. Attack rolls against it have advantage; hits from 5 feet are critical hits.",
  },
} as const satisfies Record<string, GameTermEntry>

export type EffectConditionId = keyof typeof EFFECT_CONDITION_ENTRIES

export const EFFECT_CONDITION_IDS = Object.keys(EFFECT_CONDITION_ENTRIES) as [
  EffectConditionId,
  ...EffectConditionId[],
]

export const effectConditionSchema = z.enum(EFFECT_CONDITION_IDS)

/** Returns the reference entry for a condition id, if known. */
export function getEffectConditionEntry(id: string): GameTermEntry | undefined {
  return EFFECT_CONDITION_ENTRIES[id as EffectConditionId]
}

/** Returns the display label for a condition. Falls back to the raw value. */
export function getEffectConditionLabel(id: string): string {
  return getEffectConditionEntry(id)?.label ?? id
}
