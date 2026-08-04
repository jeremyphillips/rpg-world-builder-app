import {
  getLocationKindLabel,
  isValidParentKind,
  validateLocationParentAssignment,
  type LocationHierarchyNode,
  type LocationKind,
  type LocationParentAssignmentBlocker,
  type LocationParentAssignmentBlockerCode,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import type { ContentWriteContext } from '../lib/content-write-config'
import { HomebrewLocationModel } from './homebrew-location.model'

type LocationHierarchyFields = {
  kind: LocationKind
  parentLocationId: string | undefined
  locationId: string | undefined
}

type LocationParentRecord = {
  _id: unknown
  kind: LocationKind
  parentLocationId?: string
}

const INVALID_PARENT_API_CODE = 'invalid_parent' as const
const INVALID_HIERARCHY_API_CODE = 'invalid_hierarchy' as const

const API_ERROR_CODE_BY_BLOCKER_CODE: Record<
  LocationParentAssignmentBlockerCode,
  typeof INVALID_PARENT_API_CODE | typeof INVALID_HIERARCHY_API_CODE
> = {
  parent_not_found: INVALID_PARENT_API_CODE,
  parent_forbidden: INVALID_HIERARCHY_API_CODE,
  parent_required: INVALID_HIERARCHY_API_CODE,
  self_parent: INVALID_HIERARCHY_API_CODE,
  descendant_parent: INVALID_HIERARCHY_API_CODE,
  invalid_parent_kind: INVALID_HIERARCHY_API_CODE,
  cycle: INVALID_HIERARCHY_API_CODE,
  hierarchy_violation: INVALID_HIERARCHY_API_CODE,
}

function entityBody(entity: Record<string, unknown>): Record<string, unknown> {
  const {
    id: _id,
    slug: _slug,
    rulesetId: _rulesetId,
    source: _source,
    status: _status,
    campaignId: _campaignId,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    ...body
  } = entity
  return body
}

function mergedLocationFields(ctx: ContentWriteContext): LocationHierarchyFields {
  const existingBody = ctx.existing
    ? entityBody(ctx.existing as unknown as Record<string, unknown>)
    : {}
  const merged = { ...existingBody, ...ctx.input }
  const kind = merged.kind as LocationKind | undefined
  if (!kind) {
    throw new HttpError(400, 'bad_request', 'Location kind is required.')
  }

  const parentLocationId =
    merged.parentLocationId === null ? undefined : (merged.parentLocationId as string | undefined)

  return {
    kind,
    parentLocationId,
    locationId: ctx.existing?.id,
  }
}

async function loadParentRecord(
  campaignId: string,
  parentLocationId: string,
): Promise<LocationParentRecord> {
  const parent = await HomebrewLocationModel.findOne({ _id: parentLocationId, campaignId })
    .select('kind parentLocationId')
    .lean<LocationParentRecord>()

  if (!parent) {
    throw new HttpError(
      400,
      INVALID_PARENT_API_CODE,
      'Parent location was not found in this campaign.',
    )
  }

  return parent
}

function toHierarchyNode(
  locationId: string,
  record: Pick<LocationParentRecord, 'kind' | 'parentLocationId'>,
): LocationHierarchyNode {
  return {
    id: locationId,
    kind: record.kind,
    parentLocationId: record.parentLocationId,
  }
}

async function buildHierarchyGraphForParentAssignment(
  campaignId: string,
  locationId: string | undefined,
  locationKind: LocationKind,
  proposedParentId: string,
  proposedParent: LocationParentRecord,
): Promise<Map<string, LocationHierarchyNode>> {
  const locationsById = new Map<string, LocationHierarchyNode>()
  locationsById.set(proposedParentId, toHierarchyNode(proposedParentId, proposedParent))

  if (locationId) {
    locationsById.set(locationId, {
      id: locationId,
      kind: locationKind,
      parentLocationId: undefined,
    })
  }

  const visited = new Set<string>()
  let currentId: string | undefined = proposedParent.parentLocationId

  while (currentId) {
    if (visited.has(currentId)) {
      break
    }
    visited.add(currentId)

    const ancestor = await HomebrewLocationModel.findOne({ _id: currentId, campaignId })
      .select('kind parentLocationId')
      .lean<LocationParentRecord>()
    if (!ancestor) {
      break
    }

    locationsById.set(currentId, toHierarchyNode(currentId, ancestor))
    currentId = ancestor.parentLocationId
  }

  return locationsById
}

function throwLocationParentAssignmentBlocker(blocker: LocationParentAssignmentBlocker): never {
  throw new HttpError(400, API_ERROR_CODE_BY_BLOCKER_CODE[blocker.code], blocker.message, {
    blockerCode: blocker.code,
  })
}

async function validateDirectChildrenForKindChange(
  campaignId: string,
  locationId: string,
  nextKind: LocationKind,
  previousKind: LocationKind,
): Promise<void> {
  if (nextKind === previousKind) {
    return
  }

  const children = await HomebrewLocationModel.find({
    campaignId,
    parentLocationId: locationId,
  })
    .select('kind name')
    .lean<Array<{ kind: LocationKind; name: string }>>()

  for (const child of children) {
    if (!isValidParentKind(child.kind, nextKind)) {
      throw new HttpError(
        400,
        INVALID_HIERARCHY_API_CODE,
        `Cannot change kind to ${getLocationKindLabel(nextKind)} because child location "${child.name}" requires a different parent kind.`,
      )
    }
  }
}

/** Cross-record hierarchy validation for publish-complete location writes. */
export async function validateLocationHierarchy(ctx: ContentWriteContext): Promise<void> {
  const { kind, parentLocationId, locationId } = mergedLocationFields(ctx)

  if (!parentLocationId) {
    const blockers = validateLocationParentAssignment({
      locationId: locationId ?? '',
      locationKind: kind,
      proposedParentId: null,
      locationsById: locationId
        ? new Map([[locationId, { id: locationId, kind, parentLocationId: undefined }]])
        : new Map(),
    })
    if (blockers.length > 0) {
      throwLocationParentAssignmentBlocker(blockers[0]!)
    }
  } else {
    const parent = await loadParentRecord(ctx.campaignId, parentLocationId)
    const locationsById = await buildHierarchyGraphForParentAssignment(
      ctx.campaignId,
      locationId,
      kind,
      parentLocationId,
      parent,
    )

    const blockers = validateLocationParentAssignment({
      locationId: locationId ?? '',
      locationKind: kind,
      proposedParentId: parentLocationId,
      locationsById,
    })
    if (blockers.length > 0) {
      throwLocationParentAssignmentBlocker(blockers[0]!)
    }
  }

  if (ctx.mode === 'update' && locationId && ctx.existing) {
    const previousKind = entityBody(ctx.existing as unknown as Record<string, unknown>)
      .kind as LocationKind
    await validateDirectChildrenForKindChange(ctx.campaignId, locationId, kind, previousKind)
  }
}
