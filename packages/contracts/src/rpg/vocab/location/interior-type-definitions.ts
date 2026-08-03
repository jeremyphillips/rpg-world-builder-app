import type { GameTermEntry } from '../types'

type InteriorTypeDefinition = {
  readonly label: string
  readonly description: string
  readonly subtypes: Record<string, GameTermEntry>
}

export const INTERIOR_TYPE_DEFINITIONS = {
  level: {
    label: 'Level',
    description: 'A vertical slice or story within a structure.',
    subtypes: {
      floor: {
        label: 'Floor',
        description: 'A level or story within a structure.',
      },
      cellar: {
        label: 'Cellar',
        description: 'An underground or basement level.',
      },
      attic: {
        label: 'Attic',
        description: 'An upper storage or loft space.',
      },
      basement: {
        label: 'Basement',
        description: 'A partially or fully underground level.',
      },
    },
  },
  space: {
    label: 'Space',
    description: 'An enclosed or bounded room-like area.',
    subtypes: {
      room: {
        label: 'Room',
        description: 'A single enclosed chamber.',
      },
      chamber: {
        label: 'Chamber',
        description: 'A large or significant enclosed space.',
      },
      hall: {
        label: 'Hall',
        description: 'A grand room or assembly space.',
      },
      vault: {
        label: 'Vault',
        description: 'A secured or reinforced enclosure.',
      },
    },
  },
  passage: {
    label: 'Passage',
    description: 'A connecting route between other interior spaces.',
    subtypes: {
      corridor: {
        label: 'Corridor',
        description: 'A hallway connecting other spaces.',
      },
      tunnel: {
        label: 'Tunnel',
        description: 'An enclosed underground or walled passage.',
      },
      arcade: {
        label: 'Arcade',
        description: 'A covered walkway or gallery.',
      },
    },
  },
  vertical_access: {
    label: 'Vertical Access',
    description: 'Stairs, ladders, or other means of moving between levels.',
    subtypes: {
      stairs: {
        label: 'Stairs',
        description: 'A stepped ascent or descent.',
      },
      ladder: {
        label: 'Ladder',
        description: 'A vertical climbing access.',
      },
      ramp: {
        label: 'Ramp',
        description: 'An inclined surface for movement between levels.',
      },
    },
  },
  overlook: {
    label: 'Overlook',
    description: 'An elevated platform or viewing area.',
    subtypes: {
      balcony: {
        label: 'Balcony',
        description: 'An elevated platform projecting from a wall.',
      },
      mezzanine: {
        label: 'Mezzanine',
        description: 'A partial floor overlooking a lower space.',
      },
      gallery: {
        label: 'Gallery',
        description: 'An elevated viewing walkway.',
      },
      parapet: {
        label: 'Parapet',
        description: 'A low wall at the edge of a roof or platform.',
      },
    },
  },
} as const satisfies Record<string, InteriorTypeDefinition>

export type InteriorClassificationType = keyof typeof INTERIOR_TYPE_DEFINITIONS

export const INTERIOR_CLASSIFICATION_TYPE_IDS = Object.keys(INTERIOR_TYPE_DEFINITIONS) as [
  InteriorClassificationType,
  ...InteriorClassificationType[],
]

export type InteriorSubtype<T extends InteriorClassificationType = InteriorClassificationType> =
  keyof (typeof INTERIOR_TYPE_DEFINITIONS)[T]['subtypes'] & string

/** Returns interior subtype ids for an interior type. */
export function getInteriorSubtypeIds(
  interiorType: InteriorClassificationType,
): readonly InteriorSubtype<typeof interiorType>[] {
  return Object.keys(INTERIOR_TYPE_DEFINITIONS[interiorType].subtypes) as InteriorSubtype<
    typeof interiorType
  >[]
}

/** Returns the interior subtype entry, if known. */
export function getInteriorSubtypeEntry(
  interiorType: InteriorClassificationType,
  subtypeId: string,
): GameTermEntry | undefined {
  const subtypes = INTERIOR_TYPE_DEFINITIONS[interiorType].subtypes
  return subtypes[subtypeId as keyof typeof subtypes]
}

/** Returns the display label for an interior subtype. Falls back to the raw id. */
export function getInteriorSubtypeLabel(
  interiorType: InteriorClassificationType,
  subtypeId: string,
): string {
  return getInteriorSubtypeEntry(interiorType, subtypeId)?.label ?? subtypeId
}
