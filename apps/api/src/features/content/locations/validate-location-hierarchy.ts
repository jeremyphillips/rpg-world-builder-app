import {
  getLocationKindLabel,
  isValidParentKind,
  validateLocationParentRequirement,
  type LocationKind,
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
    throw new HttpError(400, 'invalid_parent', 'Parent location was not found in this campaign.')
  }

  return parent
}

async function wouldCreateCycle(
  campaignId: string,
  locationId: string,
  proposedParentId: string,
): Promise<boolean> {
  let currentId: string | undefined = proposedParentId
  const visited = new Set<string>()

  while (currentId) {
    if (currentId === locationId) {
      return true
    }
    if (visited.has(currentId)) {
      break
    }
    visited.add(currentId)

    const ancestor: { parentLocationId?: string } | null = await HomebrewLocationModel.findOne({
      _id: currentId,
      campaignId,
    })
      .select('parentLocationId')
      .lean<{ parentLocationId?: string }>()
    if (!ancestor) {
      break
    }
    currentId = ancestor.parentLocationId
  }

  return false
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
        'invalid_hierarchy',
        `Cannot change kind to ${getLocationKindLabel(nextKind)} because child location "${child.name}" requires a different parent kind.`,
      )
    }
  }
}

/** Cross-record hierarchy validation for publish-complete location writes. */
export async function validateLocationHierarchy(ctx: ContentWriteContext): Promise<void> {
  const { kind, parentLocationId, locationId } = mergedLocationFields(ctx)

  const parentRequirementError = validateLocationParentRequirement(kind, parentLocationId)
  if (parentRequirementError) {
    throw new HttpError(400, 'invalid_hierarchy', parentRequirementError)
  }

  if (parentLocationId) {
    if (locationId && parentLocationId === locationId) {
      throw new HttpError(400, 'invalid_hierarchy', 'A location cannot be its own parent.')
    }

    const parent = await loadParentRecord(ctx.campaignId, parentLocationId)
    if (!isValidParentKind(kind, parent.kind)) {
      throw new HttpError(
        400,
        'invalid_hierarchy',
        `A ${getLocationKindLabel(kind)} cannot be placed under a ${getLocationKindLabel(parent.kind)}.`,
      )
    }

    if (locationId && (await wouldCreateCycle(ctx.campaignId, locationId, parentLocationId))) {
      throw new HttpError(
        400,
        'invalid_hierarchy',
        'Parent selection would create a circular location hierarchy.',
      )
    }
  }

  if (ctx.mode === 'update' && locationId && ctx.existing) {
    const previousKind = entityBody(ctx.existing as unknown as Record<string, unknown>)
      .kind as LocationKind
    await validateDirectChildrenForKindChange(ctx.campaignId, locationId, kind, previousKind)
  }
}
