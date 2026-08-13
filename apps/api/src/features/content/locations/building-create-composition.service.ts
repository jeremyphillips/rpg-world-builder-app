import { randomUUID } from 'node:crypto'

import { isValidObjectId, type ClientSession } from 'mongoose'
import { ZodError } from 'zod'

import {
  buildingCreateCompositionResponseSchema,
  isOrganizationLocationConnectionEligible,
  organizationLocationConnectionKindBlockedForLocation,
  type BuildingCreateCompositionIssue,
  type BuildingCreateCompositionRequest,
  type BuildingCreateCompositionResponse,
  type OrganizationLocationConnection,
  type OrganizationLocationConnectionEdgeAtLocation,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { areMongoTransactionsEnabled, runInTransaction } from '../../../lib/mongo-transaction'
import { createHomebrewContent, validateHomebrewContentCreate } from '../lib/content-write.service'
import { HomebrewOrganizationModel } from '../organizations/homebrew-organization.model'
import {
  addOrganizationLocationConnection,
  readOrganizationLocationConnections,
} from '../organizations/organization-location-connection-mutation'
import { organizationWriteConfig } from '../organizations/organizations.config'
import { locationWriteConfig } from './locations.config'

const PENDING_BUILDING_ID = '__pending_building__'

type OrganizationConnectionsDocument = {
  _id: unknown
  connections?: { locations?: OrganizationLocationConnection[] }
}

type LoadedExistingOrganizations = Map<string, OrganizationConnectionsDocument>

function issue(
  target: BuildingCreateCompositionIssue['target'],
  code: string,
  message: string,
  attribution: Partial<BuildingCreateCompositionIssue> = {},
): BuildingCreateCompositionIssue {
  return { target, code, message, ...attribution }
}

function errorIssues(
  error: unknown,
  target: BuildingCreateCompositionIssue['target'],
  attribution: Partial<BuildingCreateCompositionIssue> = {},
): BuildingCreateCompositionIssue[] {
  if (error instanceof ZodError) {
    return error.issues.map((entry) =>
      issue(target, 'validation_error', entry.message, {
        ...attribution,
        ...(entry.path.length > 0 ? { path: entry.path.join('.') } : {}),
      }),
    )
  }
  if (error instanceof HttpError) {
    return [issue(target, error.code, error.message, attribution)]
  }
  throw error
}

function existingOrganizationIds(request: BuildingCreateCompositionRequest): string[] {
  return [
    ...new Set(
      request.relationships.flatMap((relationship) =>
        relationship.organization.kind === 'existing'
          ? [relationship.organization.organizationId]
          : [],
      ),
    ),
  ]
}

async function loadExistingOrganizations(
  campaignId: string,
  request: BuildingCreateCompositionRequest,
  session?: ClientSession,
): Promise<LoadedExistingOrganizations> {
  const ids = existingOrganizationIds(request)
  if (ids.length === 0) return new Map()
  const persistedIds = ids.filter((id) => isValidObjectId(id))
  if (persistedIds.length === 0) return new Map()

  const query = HomebrewOrganizationModel.find({ _id: { $in: persistedIds }, campaignId })
  if (session) query.session(session)
  const documents = await query.lean<OrganizationConnectionsDocument[]>()
  return new Map(documents.map((document) => [String(document._id), document]))
}

function collectMissingOrganizationIssues(
  request: BuildingCreateCompositionRequest,
  loaded: LoadedExistingOrganizations,
): BuildingCreateCompositionIssue[] {
  return request.relationships.flatMap((relationship) => {
    if (
      relationship.organization.kind === 'existing' &&
      !loaded.has(relationship.organization.organizationId)
    ) {
      return [
        issue('relationship', 'organization_not_found', 'Organization not found in campaign.', {
          relationshipDraftId: relationship.relationshipDraftId,
        }),
      ]
    }
    return []
  })
}

function organizationKey(
  relationship: BuildingCreateCompositionRequest['relationships'][number],
): string {
  return relationship.organization.kind === 'existing'
    ? relationship.organization.organizationId
    : `draft:${relationship.organization.organizationDraftId}`
}

function collectRelationshipPolicyIssues(
  request: BuildingCreateCompositionRequest,
  loaded: LoadedExistingOrganizations,
): BuildingCreateCompositionIssue[] {
  const building = request.building.input
  const eligibility = {
    kind: building.kind,
    ...(building.kind === 'structure' ? { structureType: building.structureType } : {}),
  }
  const connectionsByOrganization = new Map<string, OrganizationLocationConnection[]>()
  for (const [organizationId, document] of loaded) {
    connectionsByOrganization.set(organizationId, readOrganizationLocationConnections(document))
  }
  const edges: OrganizationLocationConnectionEdgeAtLocation[] = []
  const issues: BuildingCreateCompositionIssue[] = []

  for (const relationship of request.relationships) {
    if (
      relationship.organization.kind === 'existing' &&
      !loaded.has(relationship.organization.organizationId)
    ) {
      continue
    }

    const key = organizationKey(relationship)
    const connections = connectionsByOrganization.get(key) ?? []
    const attribution = { relationshipDraftId: relationship.relationshipDraftId }
    if (!isOrganizationLocationConnectionEligible(eligibility, relationship.kind)) {
      issues.push(
        issue(
          'relationship',
          'relationship_ineligible',
          `Connection kind "${relationship.kind}" is not valid for this building.`,
          attribution,
        ),
      )
      continue
    }

    if (
      organizationLocationConnectionKindBlockedForLocation({
        locationId: PENDING_BUILDING_ID,
        kind: relationship.kind,
        subjectOrganizationId: key,
        connections,
        edgesAtLocation: edges,
      })
    ) {
      issues.push(
        issue(
          'relationship',
          'relationship_conflict',
          'This relationship conflicts with an existing or pending relationship policy.',
          attribution,
        ),
      )
      continue
    }

    const pending = {
      id: relationship.relationshipDraftId,
      locationId: PENDING_BUILDING_ID,
      kind: relationship.kind,
    }
    connectionsByOrganization.set(key, [...connections, pending])
    edges.push({
      organizationId: key,
      connectionId: relationship.relationshipDraftId,
      locationId: PENDING_BUILDING_ID,
      kind: relationship.kind,
    })
  }

  return issues
}

async function collectCreateValidationIssues(
  campaignId: string,
  request: BuildingCreateCompositionRequest,
): Promise<BuildingCreateCompositionIssue[]> {
  const issues: BuildingCreateCompositionIssue[] = []
  const building = request.building.input
  if (building.kind !== 'structure' || building.structureType !== 'building') {
    issues.push(
      issue(
        'building',
        'not_a_building',
        'Building composition requires a structure with structureType "building".',
      ),
    )
  }

  try {
    await validateHomebrewContentCreate(locationWriteConfig, campaignId, building, {
      status: request.building.status,
    })
  } catch (error) {
    issues.push(...errorIssues(error, 'building'))
  }

  const seenSlugs = new Set<string>()
  for (const draft of request.organizations) {
    if (seenSlugs.has(draft.input.slug)) {
      issues.push(
        issue('organization', 'slug_conflict', 'Organization slugs must be unique in this plan.', {
          organizationDraftId: draft.organizationDraftId,
          path: 'slug',
        }),
      )
    }
    seenSlugs.add(draft.input.slug)
    if (draft.input.connections.locations.length > 0) {
      issues.push(
        issue(
          'organization',
          'embedded_relationships_not_allowed',
          'New Organizations must declare Building relationships through relationship drafts.',
          { organizationDraftId: draft.organizationDraftId, path: 'connections.locations' },
        ),
      )
    }
    try {
      await validateHomebrewContentCreate(organizationWriteConfig, campaignId, draft.input, {
        status: draft.status,
      })
    } catch (error) {
      issues.push(
        ...errorIssues(error, 'organization', {
          organizationDraftId: draft.organizationDraftId,
        }),
      )
    }
  }
  return issues
}

function throwValidationIssues(issues: BuildingCreateCompositionIssue[]): never {
  throw new HttpError(
    422,
    'building_create_validation_failed',
    'Building create plan is invalid.',
    {
      issues,
    },
  )
}

async function preflight(
  campaignId: string,
  request: BuildingCreateCompositionRequest,
): Promise<void> {
  const loaded = await loadExistingOrganizations(campaignId, request)
  const issues = [
    ...(await collectCreateValidationIssues(campaignId, request)),
    ...collectMissingOrganizationIssues(request, loaded),
    ...collectRelationshipPolicyIssues(request, loaded),
  ]
  if (issues.length > 0) throwValidationIssues(issues)
}

async function executeComposition(
  campaignId: string,
  request: BuildingCreateCompositionRequest,
  session: ClientSession,
): Promise<BuildingCreateCompositionResponse> {
  const existing = await loadExistingOrganizations(campaignId, request, session)
  const raceIssues = [
    ...collectMissingOrganizationIssues(request, existing),
    ...collectRelationshipPolicyIssues(request, existing),
  ]
  if (raceIssues.length > 0) throwValidationIssues(raceIssues)

  const building = await createHomebrewContent(
    locationWriteConfig,
    campaignId,
    request.building.input,
    { status: request.building.status, session },
  )

  const createdOrganizations = []
  const organizationIdsByDraftId = new Map<string, string>()
  const documentsByOrganizationId = new Map<string, OrganizationConnectionsDocument>(existing)
  for (const draft of request.organizations) {
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaignId,
      draft.input,
      { status: draft.status, session },
    )
    createdOrganizations.push({ organizationDraftId: draft.organizationDraftId, organization })
    organizationIdsByDraftId.set(draft.organizationDraftId, organization.id)
    documentsByOrganizationId.set(organization.id, {
      _id: organization.id,
      connections: organization.connections,
    })
  }

  const connectionsByOrganizationId = new Map<string, OrganizationLocationConnection[]>()
  const relationshipResults = []
  for (const relationship of request.relationships) {
    const organizationId =
      relationship.organization.kind === 'existing'
        ? relationship.organization.organizationId
        : organizationIdsByDraftId.get(relationship.organization.organizationDraftId)
    if (!organizationId) {
      throw new HttpError(500, 'internal_error', 'Organization draft correlation failed.')
    }
    const document = documentsByOrganizationId.get(organizationId)
    if (!document) {
      throw new HttpError(500, 'internal_error', 'Organization write base was not loaded.')
    }
    const current =
      connectionsByOrganizationId.get(organizationId) ??
      readOrganizationLocationConnections(document)
    const next = addOrganizationLocationConnection(current, {
      id: randomUUID(),
      locationId: building.id,
      kind: relationship.kind,
    })
    const connection = next.at(-1)
    if (!connection) {
      throw new HttpError(500, 'internal_error', 'Relationship create returned no connection.')
    }
    connectionsByOrganizationId.set(organizationId, next)
    relationshipResults.push({
      relationshipDraftId: relationship.relationshipDraftId,
      organizationId,
      connection,
    })
  }

  for (const [organizationId, connections] of connectionsByOrganizationId) {
    const result = await HomebrewOrganizationModel.updateOne(
      { _id: organizationId, campaignId },
      { $set: { 'connections.locations': connections } },
      { session },
    )
    if (result.matchedCount !== 1) {
      throw new HttpError(404, 'not_found', 'Organization not found in campaign.')
    }
  }

  const finalizedOrganizations = createdOrganizations.map((row) => ({
    ...row,
    organization: {
      ...row.organization,
      connections: {
        locations:
          connectionsByOrganizationId.get(row.organization.id) ??
          row.organization.connections.locations,
      },
    },
  }))

  return buildingCreateCompositionResponseSchema.parse({
    building,
    organizations: finalizedOrganizations,
    relationships: relationshipResults,
  })
}

/** Atomically create one Building, optional Organizations, and all declared relationships. */
export async function createBuildingComposition(
  campaignId: string,
  request: BuildingCreateCompositionRequest,
): Promise<BuildingCreateCompositionResponse> {
  if (!areMongoTransactionsEnabled()) {
    throw new HttpError(
      503,
      'transactions_unavailable',
      'Atomic Building creation is unavailable because MongoDB transactions are disabled.',
      {
        issues: [
          issue(
            'capability',
            'transactions_unavailable',
            'Atomic Building creation requires MongoDB transaction support.',
          ),
        ],
      },
    )
  }

  await preflight(campaignId, request)
  return runInTransaction((session) => executeComposition(campaignId, request, session))
}
