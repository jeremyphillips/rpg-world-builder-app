import type { LocationAuthoringType } from './location-authoring-type'

export type LocationAuthoringDescriptionScope = {
  parentAuthoringType: LocationAuthoringType
  childAuthoringType: LocationAuthoringType
}

const BUILDING_CHILD_MENU_DESCRIPTION =
  'Add a distinct structure—not a room—such as an annex, tower, stable, or workshop.'

/** Sparse parent+child overrides when copy must differ from the child default. */
const LOCATION_AUTHORING_OPTION_DESCRIPTION_OVERRIDES: Partial<
  Record<LocationAuthoringType, Partial<Record<LocationAuthoringType, string>>>
> = {}

/** One-line menu helper per child authoring type (add-child menus). */
const LOCATION_AUTHORING_CHILD_MENU_DEFAULT_DESCRIPTIONS: Partial<
  Record<LocationAuthoringType, string>
> = {
  building: BUILDING_CHILD_MENU_DESCRIPTION,
  site: 'A bounded outdoor or mixed-use place contained by this location.',
  district: 'A named ward or quarter inside a settlement.',
  settlement: 'A town, city, or other grouped community under this region.',
  region: 'A geographic or political subdivision under this location.',
  world: 'A full world or major plane-level container.',
  plane: 'A distinct plane or cosmology layer.',
  interior: 'An enclosed room or hall inside a parent interior.',
  fortification: 'A defensive work such as a wall, tower, or keep.',
  infrastructure: 'A constructed utility or transport work such as a bridge or aqueduct.',
  monument: 'A commemorative or symbolic constructed landmark.',
  vessel: 'A ship or other mobile craft treated as a visitable structure.',
  structure: 'A structure without a more specific built-form classification.',
}

/** Contextual helper copy for a child authoring option under a specific parent authoring type. */
export function resolveLocationAuthoringOptionDescription(
  scope: LocationAuthoringDescriptionScope,
): string {
  const override =
    LOCATION_AUTHORING_OPTION_DESCRIPTION_OVERRIDES[scope.parentAuthoringType]?.[
      scope.childAuthoringType
    ]
  if (override) {
    return override
  }

  const defaultDescription =
    LOCATION_AUTHORING_CHILD_MENU_DEFAULT_DESCRIPTIONS[scope.childAuthoringType]
  if (!defaultDescription) {
    throw new Error(
      `Missing add-child menu description for child authoring type "${scope.childAuthoringType}"`,
    )
  }

  return defaultDescription
}
