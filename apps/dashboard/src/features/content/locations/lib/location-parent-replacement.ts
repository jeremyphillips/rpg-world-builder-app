import {
  validateLocationParentAssignment,
  getParentRequirement,
  type Location,
} from '@rpg/contracts'
import type { QueryClient } from '@tanstack/react-query'

import { updateContent } from '../../lib/list/content-client'
import { invalidateContentWriteQueries } from '../../lib/list/use-content-mutations'
import { locationsQueryKey } from '../hooks/use-locations'

import { buildLocationHierarchyGraph } from './build-location-hierarchy-graph'
import {
  buildLocationEntitySummaryVm,
  buildLocationEntityContextPresentation,
  buildLocationsById,
  LOCATION_UNKNOWN_ANCESTOR_LABEL,
  type LocationEntitySummaryVm,
} from './location-display'

export const LOCATION_PARENT_REPLACEMENT_ACTION_LABELS = {
  changeParent: 'Change parent',
  setParent: 'Set parent',
} as const

export type LocationParentReplacementAction =
  | keyof typeof LOCATION_PARENT_REPLACEMENT_ACTION_LABELS
  | null

export type LocationParentReplacementMode = 'change' | 'set'

import type { DrawerContextEntityPresentation } from '../../lib/relationship/drawer-context.types'

export type LocationParentReplacementCurrentSnapshot = {
  parentLocationId: string
  entity: DrawerContextEntityPresentation
  imageKey?: string
  unavailable?: boolean
}

export function resolveLocationParentReplacementMode(
  subject: Pick<Location, 'parentLocationId'>,
): LocationParentReplacementMode {
  return subject.parentLocationId ? 'change' : 'set'
}

export function resolveLocationParentReplacementAction(input: {
  subject: Pick<Location, 'kind' | 'parentLocationId'>
  canManage: boolean
}): LocationParentReplacementAction {
  if (!input.canManage) {
    return null
  }

  if (getParentRequirement(input.subject.kind) === 'forbidden') {
    return null
  }

  if (input.subject.parentLocationId) {
    return 'changeParent'
  }

  return 'setParent'
}

export function resolveLocationParentReplacementCurrentSnapshot(input: {
  subject: Pick<Location, 'parentLocationId'>
  locationsById: ReadonlyMap<string, Location>
  campaignId: string
}): LocationParentReplacementCurrentSnapshot | null {
  const parentLocationId = input.subject.parentLocationId
  if (!parentLocationId) {
    return null
  }

  const parent = input.locationsById.get(parentLocationId)
  if (!parent) {
    return {
      parentLocationId,
      entity: { heading: LOCATION_UNKNOWN_ANCESTOR_LABEL },
      unavailable: true,
    }
  }

  const summary = buildLocationEntitySummaryVm(parent, {
    locationsById: input.locationsById,
    campaignId: input.campaignId,
  })

  return {
    parentLocationId,
    entity: buildLocationEntityContextPresentation(summary),
    imageKey: summary.imageKey,
  }
}

export function buildEligibleLocationParentReplacementCandidates(input: {
  subject: Pick<Location, 'id' | 'kind' | 'parentLocationId'>
  campaignLocations: readonly Location[]
}): Location[] {
  const locationsById = buildLocationHierarchyGraph(input.campaignLocations)
  const currentParentId = input.subject.parentLocationId

  return input.campaignLocations
    .filter((candidate) => {
      if (candidate.id === input.subject.id) {
        return false
      }

      if (currentParentId != null && candidate.id === currentParentId) {
        return false
      }

      return (
        validateLocationParentAssignment({
          locationId: input.subject.id,
          locationKind: input.subject.kind,
          proposedParentId: candidate.id,
          locationsById,
        }).length === 0
      )
    })
    .sort((left, right) => left.name.localeCompare(right.name))
}

export function buildLocationParentReplacementCandidateSummaries(input: {
  candidates: readonly Location[]
  locationsById: ReadonlyMap<string, Location>
  campaignId: string
}): LocationEntitySummaryVm[] {
  return input.candidates.map((candidate) =>
    buildLocationEntitySummaryVm(candidate, {
      locationsById: input.locationsById,
      campaignId: input.campaignId,
    }),
  )
}

export function hasLocationParentReplacementContextMismatch(input: {
  subject: Pick<Location, 'parentLocationId'>
  expectedParentLocationId: string
}): boolean {
  return input.subject.parentLocationId !== input.expectedParentLocationId
}

export function canSubmitLocationParentReplacement(input: {
  mode: LocationParentReplacementMode
  subject: Pick<Location, 'parentLocationId'>
  selectedParentId: string | null
}): boolean {
  if (!input.selectedParentId) {
    return false
  }

  if (input.mode === 'set') {
    return true
  }

  return input.selectedParentId !== input.subject.parentLocationId
}

export async function applyLocationParentReplacement(input: {
  campaignId: string
  subjectId: string
  newParentLocationId: string
}): Promise<void> {
  await updateContent(input.campaignId, 'locations', input.subjectId, {
    parentLocationId: input.newParentLocationId,
  })
}

export function invalidateLocationParentReplacementQueries(
  queryClient: QueryClient,
  campaignId: string,
): void {
  invalidateContentWriteQueries(queryClient, campaignId, locationsQueryKey)
}

export function buildLocationParentReplacementContext(input: {
  subject: Location
  campaignLocations: readonly Location[]
  campaignId: string
}) {
  const locationsById = buildLocationsById(input.campaignLocations)
  const candidates = buildEligibleLocationParentReplacementCandidates({
    subject: input.subject,
    campaignLocations: input.campaignLocations,
  })

  return {
    mode: resolveLocationParentReplacementMode(input.subject),
    currentParent: resolveLocationParentReplacementCurrentSnapshot({
      subject: input.subject,
      locationsById,
      campaignId: input.campaignId,
    }),
    candidates,
    candidateSummaries: buildLocationParentReplacementCandidateSummaries({
      candidates,
      locationsById,
      campaignId: input.campaignId,
    }),
  }
}
