import {
  isOrganizationLocationConnectionEligible,
  midSentenceLabel,
  type Location,
  type OrganizationLocationConnectionKind,
} from '@rpg/contracts'

import { formatContentCreateActionLabel } from '../content-type-labels'
import {
  canonicalFieldsForAuthoringType,
  LOCATION_AUTHORING_TYPE_IDS,
  type LocationAuthoringType,
} from '../../locations/lib/location-authoring-type'
import { getLocationAuthoringTypeLabel } from '../../locations/lib/location-create-shortcuts'
import {
  locationMatchesTargetBrowseScope,
  type OrganizationLocationTargetBrowseScope,
} from '../../organizations/lib/organization-location-target-browse-scope'

export type RelationshipPickerCreateIntentInput =
  | { target: 'organization' }
  | {
      target: 'location'
      selectedKind: OrganizationLocationConnectionKind
      activeBrowseScope?: OrganizationLocationTargetBrowseScope
      parentLocationId?: string
    }

export type RelationshipPickerCreateIntent =
  | { target: 'organization'; id: 'organization'; label: string }
  | {
      target: 'location'
      id: LocationAuthoringType
      label: string
      authoringType: LocationAuthoringType
    }

const PARENT_REQUIRED_AUTHORING_TYPES = new Set<LocationAuthoringType>(['district', 'interior'])

const KIND_AUTHORING_TYPE_OVERRIDES: Partial<
  Record<OrganizationLocationConnectionKind, readonly LocationAuthoringType[]>
> = {
  tenant: ['building'],
}

const LOCATION_AUTHORING_TYPE_ORDER = new Map(
  LOCATION_AUTHORING_TYPE_IDS.map((authoringType, index) => [authoringType, index]),
)

export const RELATIONSHIP_PICKER_CREATE_MENU_LABEL = 'Create new' as const

function formatLocationCreateIntentLabel(authoringType: LocationAuthoringType): string {
  return `Create ${midSentenceLabel(getLocationAuthoringTypeLabel(authoringType))}`
}

function authoringTypeEligibleForOrganizationKind(
  authoringType: LocationAuthoringType,
  selectedKind: OrganizationLocationConnectionKind,
): boolean {
  if (authoringType === 'site') {
    return false
  }

  return isOrganizationLocationConnectionEligible(
    canonicalFieldsForAuthoringType(authoringType),
    selectedKind,
  )
}

function authoringTypeAllowedForBrowseScope(
  authoringType: LocationAuthoringType,
  activeBrowseScope: OrganizationLocationTargetBrowseScope | undefined,
): boolean {
  if (!activeBrowseScope || activeBrowseScope === 'all') {
    return true
  }

  return locationMatchesTargetBrowseScope(
    { kind: canonicalFieldsForAuthoringType(authoringType).kind } as Location,
    activeBrowseScope,
  )
}

function authoringTypeAllowedForParentContext(
  authoringType: LocationAuthoringType,
  parentLocationId: string | undefined,
): boolean {
  if (!PARENT_REQUIRED_AUTHORING_TYPES.has(authoringType)) {
    return true
  }

  return Boolean(parentLocationId)
}

function resolveLocationCreateIntents(
  input: Extract<RelationshipPickerCreateIntentInput, { target: 'location' }>,
): RelationshipPickerCreateIntent[] {
  const kindOverride = KIND_AUTHORING_TYPE_OVERRIDES[input.selectedKind]

  const eligibleAuthoringTypes = LOCATION_AUTHORING_TYPE_IDS.filter(
    (authoringType) =>
      (!kindOverride || kindOverride.includes(authoringType)) &&
      authoringTypeEligibleForOrganizationKind(authoringType, input.selectedKind) &&
      authoringTypeAllowedForBrowseScope(authoringType, input.activeBrowseScope) &&
      authoringTypeAllowedForParentContext(authoringType, input.parentLocationId),
  ).sort(
    (left, right) =>
      (LOCATION_AUTHORING_TYPE_ORDER.get(left) ?? Number.MAX_SAFE_INTEGER) -
      (LOCATION_AUTHORING_TYPE_ORDER.get(right) ?? Number.MAX_SAFE_INTEGER),
  )

  return eligibleAuthoringTypes.map((authoringType) => ({
    target: 'location' as const,
    id: authoringType,
    label: formatLocationCreateIntentLabel(authoringType),
    authoringType,
  }))
}

/** Resolves nested-create intents for relationship entity pickers. */
export function resolveRelationshipPickerCreateIntents(
  input: RelationshipPickerCreateIntentInput,
): RelationshipPickerCreateIntent[] {
  if (input.target === 'organization') {
    return [
      {
        target: 'organization',
        id: 'organization',
        label: formatContentCreateActionLabel('organizations'),
      },
    ]
  }

  return resolveLocationCreateIntents(input)
}
