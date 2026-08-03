import type { GameTermEntry } from '../types'

type BuildingTypeDefinition = {
  readonly label: string
  readonly description: string
  readonly subtypes: Record<string, GameTermEntry>
}

export const BUILDING_TYPE_DEFINITIONS = {
  business: {
    label: 'Business',
    description: 'Commercial or hospitality buildings.',
    subtypes: {
      tavern: {
        label: 'Tavern',
        description: 'An inn, tavern, or similar hospitality venue.',
      },
      inn: {
        label: 'Inn',
        description: 'A lodging house that also serves food and drink.',
      },
      shop: {
        label: 'Shop',
        description: 'A storefront or retail establishment.',
      },
      warehouse: {
        label: 'Warehouse',
        description: 'A storage or logistics structure.',
      },
      market: {
        label: 'Market',
        description: 'A covered or open trading hall.',
      },
    },
  },
  civic: {
    label: 'Civic',
    description: 'Governmental or public-service buildings.',
    subtypes: {
      guard_post: {
        label: 'Guard Post',
        description: 'A watch station or local security outpost.',
      },
      town_hall: {
        label: 'Town Hall',
        description: 'A civic administration building.',
      },
      courthouse: {
        label: 'Courthouse',
        description: 'A building where legal proceedings are held.',
      },
      prison: {
        label: 'Prison',
        description: 'A jail or detention facility.',
      },
    },
  },
  religious: {
    label: 'Religious',
    description: 'Places of worship or religious community.',
    subtypes: {
      temple: {
        label: 'Temple',
        description: 'A religious or ceremonial structure.',
      },
      shrine: {
        label: 'Shrine',
        description: 'A small consecrated place of devotion.',
      },
      monastery: {
        label: 'Monastery',
        description: 'A cloistered religious community.',
      },
      cathedral: {
        label: 'Cathedral',
        description: 'A principal church or seat of a faith.',
      },
    },
  },
  residential: {
    label: 'Residential',
    description: 'Homes and private dwellings.',
    subtypes: {
      manor: {
        label: 'Manor',
        description: 'A noble estate or large residence.',
      },
      house: {
        label: 'House',
        description: 'A private dwelling.',
      },
      tenement: {
        label: 'Tenement',
        description: 'A multi-unit residential building.',
      },
    },
  },
  guild: {
    label: 'Guild',
    description: 'A guild hall or professional association building.',
    subtypes: {
      guildhall: {
        label: 'Guildhall',
        description: 'The headquarters of a craft or trade guild.',
      },
      workshop: {
        label: 'Workshop',
        description: 'A guild-operated production space.',
      },
    },
  },
  military: {
    label: 'Military',
    description: 'Buildings supporting armed forces.',
    subtypes: {
      barracks: {
        label: 'Barracks',
        description: 'Quarters for soldiers or guards.',
      },
      armory: {
        label: 'Armory',
        description: 'A weapons and armor storage facility.',
      },
    },
  },
  industrial: {
    label: 'Industrial',
    description: 'Production and resource-processing buildings.',
    subtypes: {
      forge: {
        label: 'Forge',
        description: 'A smithy or metalworking shop.',
      },
      mill: {
        label: 'Mill',
        description: 'A grain, lumber, or textile mill.',
      },
      factory: {
        label: 'Factory',
        description: 'A large-scale manufacturing facility.',
      },
    },
  },
  entertainment: {
    label: 'Entertainment',
    description: 'Venues for performance or spectacle.',
    subtypes: {
      theater: {
        label: 'Theater',
        description: 'A stage for plays or performances.',
      },
      arena: {
        label: 'Arena',
        description: 'A combat or games venue.',
      },
    },
  },
} as const satisfies Record<string, BuildingTypeDefinition>

export type BuildingType = keyof typeof BUILDING_TYPE_DEFINITIONS

export const BUILDING_TYPE_IDS = Object.keys(BUILDING_TYPE_DEFINITIONS) as [
  BuildingType,
  ...BuildingType[],
]

export type BuildingSubtype<T extends BuildingType = BuildingType> =
  keyof (typeof BUILDING_TYPE_DEFINITIONS)[T]['subtypes'] & string

/** Returns building subtype ids for a building type. */
export function getBuildingSubtypeIds(type: BuildingType): readonly BuildingSubtype<typeof type>[] {
  return Object.keys(BUILDING_TYPE_DEFINITIONS[type].subtypes) as BuildingSubtype<typeof type>[]
}

/** Returns the building type entry, if known. */
export function getBuildingTypeEntry(type: string): BuildingTypeDefinition | undefined {
  return BUILDING_TYPE_DEFINITIONS[type as BuildingType]
}

/** Returns the building subtype entry, if known. */
export function getBuildingSubtypeEntry(
  type: BuildingType,
  subtypeId: string,
): GameTermEntry | undefined {
  const subtypes = BUILDING_TYPE_DEFINITIONS[type].subtypes
  return subtypes[subtypeId as keyof typeof subtypes]
}

/** Returns the display label for a building type. Falls back to the raw id. */
export function getBuildingTypeLabel(type: string): string {
  return getBuildingTypeEntry(type)?.label ?? type
}

/** Returns the display label for a building subtype. Falls back to the raw id. */
export function getBuildingSubtypeLabel(type: BuildingType, subtypeId: string): string {
  return getBuildingSubtypeEntry(type, subtypeId)?.label ?? subtypeId
}
