import { getLocationKindLabel, type LocationKind } from '../../vocab/location/kind'

import {
  getParentRequirement,
  isValidParentKind,
  validateLocationParentRequirement,
} from './hierarchy'

export const LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES = {
  self_parent: 'self_parent',
  descendant_parent: 'descendant_parent',
  parent_required: 'parent_required',
  parent_forbidden: 'parent_forbidden',
  invalid_parent_kind: 'invalid_parent_kind',
  parent_not_found: 'parent_not_found',
  cycle: 'cycle',
} as const

export type LocationParentAssignmentBlockerCode =
  (typeof LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES)[keyof typeof LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES]

export type LocationParentAssignmentBlocker = {
  kind: 'rule'
  code: LocationParentAssignmentBlockerCode
  message: string
}

export type LocationHierarchyNode = {
  id: string
  kind: LocationKind
  parentLocationId?: string
}

export type LocationParentAssignmentInput = {
  locationId: string
  locationKind: LocationKind
  proposedParentId: string | null
  locationsById: ReadonlyMap<string, LocationHierarchyNode>
}

function createLocationParentAssignmentBlocker(
  code: LocationParentAssignmentBlockerCode,
  message: string,
): LocationParentAssignmentBlocker {
  return { kind: 'rule', code, message }
}

function block(
  code: LocationParentAssignmentBlockerCode,
  message: string,
): LocationParentAssignmentBlocker[] {
  return [createLocationParentAssignmentBlocker(code, message)]
}

export function buildLocationHierarchyGraphFromNodes(
  locations: readonly LocationHierarchyNode[],
): ReadonlyMap<string, LocationHierarchyNode> {
  return new Map(locations.map((location) => [location.id, location]))
}

function isDescendantLocation(
  locationId: string,
  candidateId: string,
  locationsById: ReadonlyMap<string, LocationHierarchyNode>,
): boolean {
  const visited = new Set<string>()
  const queue = [locationId]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    if (currentId === candidateId) {
      return true
    }
    if (visited.has(currentId)) {
      continue
    }
    visited.add(currentId)

    for (const location of locationsById.values()) {
      if (location.parentLocationId === currentId && !visited.has(location.id)) {
        queue.push(location.id)
      }
    }
  }

  return false
}

function wouldCreateLocationHierarchyCycle(
  locationId: string,
  proposedParentId: string,
  locationsById: ReadonlyMap<string, LocationHierarchyNode>,
): boolean {
  const visited = new Set<string>()
  let currentId: string | undefined = proposedParentId

  while (currentId) {
    if (currentId === locationId) {
      return true
    }
    if (visited.has(currentId)) {
      break
    }
    visited.add(currentId)

    const ancestor = locationsById.get(currentId)
    if (!ancestor) {
      break
    }
    currentId = ancestor.parentLocationId
  }

  return false
}

type ParentAssignmentCheck = (
  input: LocationParentAssignmentInput,
) => LocationParentAssignmentBlocker[] | null

function checkParentForbidden({
  locationKind,
  proposedParentId,
}: LocationParentAssignmentInput): LocationParentAssignmentBlocker[] | null {
  if (getParentRequirement(locationKind) !== 'forbidden' || proposedParentId === null) {
    return null
  }

  return block(
    LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.parent_forbidden,
    'This location kind cannot have a parent.',
  )
}

function checkParentRequiredWhenNull({
  locationKind,
  proposedParentId,
}: LocationParentAssignmentInput): LocationParentAssignmentBlocker[] | null {
  if (getParentRequirement(locationKind) !== 'required' || proposedParentId !== null) {
    return null
  }

  return block(
    LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.parent_required,
    'This location kind requires a parent location.',
  )
}

function checkClearParentRequirement({
  locationKind,
  proposedParentId,
}: LocationParentAssignmentInput): LocationParentAssignmentBlocker[] | null {
  if (proposedParentId !== null) {
    return null
  }

  const requirementError = validateLocationParentRequirement(locationKind, undefined)
  if (!requirementError) {
    return []
  }

  return block(LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.parent_required, requirementError)
}

function checkSelfParent({
  locationId,
  proposedParentId,
}: LocationParentAssignmentInput): LocationParentAssignmentBlocker[] | null {
  if (proposedParentId === null || proposedParentId !== locationId) {
    return null
  }

  return block(
    LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.self_parent,
    'A location cannot be its own parent.',
  )
}

function checkParentExists({
  proposedParentId,
  locationsById,
}: LocationParentAssignmentInput): LocationParentAssignmentBlocker[] | null {
  if (proposedParentId === null || locationsById.has(proposedParentId)) {
    return null
  }

  return block(
    LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.parent_not_found,
    'Parent location was not found in this campaign.',
  )
}

function checkDescendantParent(
  input: LocationParentAssignmentInput,
): LocationParentAssignmentBlocker[] | null {
  const { locationId, proposedParentId, locationsById } = input
  if (
    proposedParentId === null ||
    !isDescendantLocation(locationId, proposedParentId, locationsById)
  ) {
    return null
  }

  return block(
    LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.descendant_parent,
    'A location cannot be moved under one of its descendants.',
  )
}

function checkValidParentKind({
  locationKind,
  proposedParentId,
  locationsById,
}: LocationParentAssignmentInput): LocationParentAssignmentBlocker[] | null {
  if (proposedParentId === null) {
    return null
  }

  const parent = locationsById.get(proposedParentId)
  if (!parent || isValidParentKind(locationKind, parent.kind)) {
    return null
  }

  return block(
    LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.invalid_parent_kind,
    `A ${getLocationKindLabel(locationKind)} cannot be placed under a ${getLocationKindLabel(parent.kind)}.`,
  )
}

function checkHierarchyCycle(
  input: LocationParentAssignmentInput,
): LocationParentAssignmentBlocker[] | null {
  const { locationId, proposedParentId, locationsById } = input
  if (
    proposedParentId === null ||
    !wouldCreateLocationHierarchyCycle(locationId, proposedParentId, locationsById)
  ) {
    return null
  }

  return block(
    LOCATION_PARENT_ASSIGNMENT_BLOCKER_CODES.cycle,
    'This parent would create a circular location hierarchy.',
  )
}

const PARENT_ASSIGNMENT_CHECKS: ParentAssignmentCheck[] = [
  checkParentForbidden,
  checkParentRequiredWhenNull,
  checkClearParentRequirement,
  checkSelfParent,
  checkParentExists,
  checkDescendantParent,
  checkValidParentKind,
  checkHierarchyCycle,
]

/** Validates whether a location may be assigned the proposed parent within a hierarchy graph. */
export function validateLocationParentAssignment(
  input: LocationParentAssignmentInput,
): LocationParentAssignmentBlocker[] {
  for (const check of PARENT_ASSIGNMENT_CHECKS) {
    const result = check(input)
    if (result !== null) {
      return result
    }
  }

  return []
}
