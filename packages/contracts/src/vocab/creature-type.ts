import { z } from 'zod'

import type { GameTermEntry } from './types'

// ---------------------------------------------------------------------------
// Creature types — the closed SRD 5.2.1 taxonomy of what a creature is, shared
// by species (playable creatures are typically Humanoid) and monsters.
// ---------------------------------------------------------------------------

export const CREATURE_TYPE_ENTRIES = {
  aberration: {
    label: 'Aberration',
    description:
      'Aberrations are utterly alien beings whose anatomy and senses defy the natural order (e.g. aboleths, mind flayers, beholders).',
  },
  beast: {
    label: 'Beast',
    description:
      'Beasts are nonhumanoid creatures that are a natural part of the fantasy ecology (e.g. animals, dinosaurs, giant insects).',
  },
  celestial: {
    label: 'Celestial',
    description:
      'Celestials are creatures native to the Upper Planes, many of them the servants of deities (e.g. angels, couatls, pegasi).',
  },
  construct: {
    label: 'Construct',
    description:
      'Constructs are made, not born—built to follow orders, whether mindless automatons or sentient creations (e.g. golems, animated objects).',
  },
  dragon: {
    label: 'Dragon',
    description:
      'Dragons are large reptilian creatures of ancient origin and tremendous power, including true dragons, wyverns, and dragon-kin.',
  },
  elemental: {
    label: 'Elemental',
    description:
      'Elementals are creatures native to the elemental planes, embodying earth, air, fire, and water (e.g. elementals, genies, mephits).',
  },
  fey: {
    label: 'Fey',
    description:
      'Fey are magical creatures closely tied to the forces of nature and the Feywild (e.g. dryads, pixies, hags).',
  },
  fiend: {
    label: 'Fiend',
    description:
      'Fiends are creatures of wickedness native to the Lower Planes (e.g. demons, devils, yugoloths).',
  },
  giant: {
    label: 'Giant',
    description:
      'Giants tower over humans and their kind, ranging from ogres and trolls to true giants with their own societies.',
  },
  humanoid: {
    label: 'Humanoid',
    description:
      'Humanoids are the main peoples of a fantasy world, both civilized and savage, and include most playable species (e.g. humans, elves, dwarves, orcs).',
  },
  monstrosity: {
    label: 'Monstrosity',
    description:
      'Monstrosities are frightening creatures that are not ordinary, not truly natural, and almost never benign (e.g. owlbears, chimeras, minotaurs).',
  },
  ooze: {
    label: 'Ooze',
    description:
      'Oozes are gelatinous creatures that rarely have a fixed shape, dwelling in caverns and dungeons and subsisting on refuse and prey (e.g. gelatinous cubes, black puddings).',
  },
  plant: {
    label: 'Plant',
    description:
      'Plants are vegetable creatures, not ordinary flora—ranging from ambulatory shrubs to fungal monsters (e.g. treants, shambling mounds, myconids).',
  },
  undead: {
    label: 'Undead',
    description:
      'Undead are once-living creatures brought to a horrifying state of undeath through necromancy or curse (e.g. zombies, vampires, liches, ghosts).',
  },
} as const satisfies Record<string, GameTermEntry>

export type CreatureType = keyof typeof CREATURE_TYPE_ENTRIES

export const CREATURE_TYPES = Object.keys(CREATURE_TYPE_ENTRIES) as [
  CreatureType,
  ...CreatureType[],
]

export const creatureTypeSchema = z.enum(CREATURE_TYPES)

/** Returns the reference entry for a creature type id, if known. */
export function getCreatureTypeEntry(id: string): GameTermEntry | undefined {
  return CREATURE_TYPE_ENTRIES[id as CreatureType]
}

/** Returns the display label for a creature type id. Falls back to the raw value. */
export function getCreatureTypeLabel(id: string): string {
  return getCreatureTypeEntry(id)?.label ?? id
}
