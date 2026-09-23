import type {
  CharacterRelationshipEdge,
  CharacterRelationshipProjectionRow,
  NpcCharacter,
  PcCharacter,
} from '@rpg/contracts'
import {
  getCharacterRelationshipEdgeKindDisplayLabel,
  getCharacterRelationshipEdgeKindSection,
  isCampaignManager,
  isViewerRelationshipSource,
  resolveRelationshipProjectionRoleLabel,
} from '@rpg/contracts'

import { canViewerSeeCharacterRelationship } from './character-relationship-visibility.lib'

import { findNpcById, findPcById } from '../../character'
import type { HomebrewDoc } from '../../content/lib/content-write-config'
import { HomebrewLocationModel } from '../../content/locations/homebrew-location.model'
import { toHomebrewLocation } from '../../content/locations/locations.config'
import { HomebrewOrganizationModel } from '../../content/organizations/homebrew-organization.model'

type ViewerContext = {
  viewerUserId: string
  viewerRole: 'owner' | 'co-owner' | 'pc' | 'observer'
  viewerCharacterId: string
}

type ProjectionRowContext = {
  relationship: CharacterRelationshipEdge
  viewer: ViewerContext
  roleLabel: string
  capabilities: CharacterRelationshipProjectionRow['capabilities']
}

const LOCATION_RELATIONSHIP_KINDS = new Set([
  'resides_at',
  'owns',
  'tenant',
  'operator',
  'works_at',
  'hometown',
  'birthplace',
])

async function resolveCharacterTarget(
  characterId: string,
): Promise<PcCharacter | NpcCharacter | null> {
  const pc = await findPcById(characterId)
  if (pc) return pc
  return findNpcById(characterId)
}

async function resolveOrganizationTarget(organizationId: string) {
  const doc = await HomebrewOrganizationModel.findById(organizationId).lean<HomebrewDoc | null>()
  if (!doc) return null
  return { id: String(doc._id), name: String(doc.name), slug: String(doc.slug) }
}

async function resolveLocationTarget(locationId: string) {
  const doc = await HomebrewLocationModel.findById(locationId).lean<HomebrewDoc | null>()
  if (!doc) return null
  const location = toHomebrewLocation(doc)
  return { id: location.id, name: location.name, slug: location.slug }
}

function buildProjectionRowBase({
  relationship,
  roleLabel,
  capabilities,
  referenceStatus,
  target,
}: ProjectionRowContext & {
  referenceStatus: CharacterRelationshipProjectionRow['referenceStatus']
  target?: CharacterRelationshipProjectionRow['target']
}): CharacterRelationshipProjectionRow {
  return {
    relationshipId: relationship.id,
    kind: relationship.kind,
    section: getCharacterRelationshipEdgeKindSection(relationship.kind),
    roleLabel,
    details: relationship.details,
    visibility: relationship.visibility,
    referenceStatus,
    target,
    revision: relationship.revision,
    capabilities,
  }
}

async function projectOrganizationRelationshipRow(
  context: ProjectionRowContext & {
    relationship: Extract<CharacterRelationshipEdge, { kind: 'organizationMembership' }>
  },
): Promise<CharacterRelationshipProjectionRow> {
  const organization = await resolveOrganizationTarget(context.relationship.organizationId)
  return buildProjectionRowBase({
    ...context,
    referenceStatus: organization ? 'resolved' : 'deleted',
    target: organization
      ? {
          type: 'organization',
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        }
      : undefined,
  })
}

async function projectLocationRelationshipRow(
  context: ProjectionRowContext & {
    relationship: Extract<
      CharacterRelationshipEdge,
      {
        kind: 'resides_at' | 'owns' | 'tenant' | 'operator' | 'works_at' | 'hometown' | 'birthplace'
      }
    >
  },
): Promise<CharacterRelationshipProjectionRow> {
  const location = await resolveLocationTarget(context.relationship.locationId)
  return buildProjectionRowBase({
    ...context,
    referenceStatus: location ? 'resolved' : 'deleted',
    target: location
      ? { type: 'location', id: location.id, name: location.name, slug: location.slug }
      : undefined,
  })
}

async function projectCharacterRelationshipTargetRow(
  context: ProjectionRowContext & {
    relationship: Extract<
      CharacterRelationshipEdge,
      { kind: 'parentOf' | 'partnerOf' | 'siblingOf' | 'mentorOf' | 'rivalOf' }
    >
  },
): Promise<CharacterRelationshipProjectionRow> {
  const targetCharacterId = isViewerRelationshipSource(
    context.viewer.viewerCharacterId,
    context.relationship,
  )
    ? context.relationship.relatedCharacterId
    : context.relationship.characterId

  const character = await resolveCharacterTarget(targetCharacterId)
  return buildProjectionRowBase({
    ...context,
    referenceStatus: character ? 'resolved' : 'deleted',
    target: character
      ? {
          type: 'character',
          id: character.id,
          name: character.name,
          characterType: character.characterType,
        }
      : undefined,
  })
}

export async function projectCharacterRelationshipRow(
  relationship: CharacterRelationshipEdge,
  viewer: ViewerContext,
): Promise<CharacterRelationshipProjectionRow | null> {
  if (!canViewerSeeCharacterRelationship(relationship, viewer)) {
    return null
  }

  const context: ProjectionRowContext = {
    relationship,
    viewer,
    roleLabel: resolveRelationshipProjectionRoleLabel({
      kind: relationship.kind,
      viewerCharacterId: viewer.viewerCharacterId,
      sourceCharacterId: relationship.characterId,
      forwardLabel: getCharacterRelationshipEdgeKindDisplayLabel(relationship.kind, 'forward'),
      inverseLabel: getCharacterRelationshipEdgeKindDisplayLabel(relationship.kind, 'inverse'),
    }),
    capabilities: {
      canUpdateDetails: isCampaignManager(viewer.viewerRole),
      canDelete: isCampaignManager(viewer.viewerRole),
    },
  }

  if (relationship.kind === 'organizationMembership') {
    return projectOrganizationRelationshipRow({
      ...context,
      relationship,
    })
  }

  if (LOCATION_RELATIONSHIP_KINDS.has(relationship.kind)) {
    return projectLocationRelationshipRow({
      ...context,
      relationship: relationship as Extract<
        CharacterRelationshipEdge,
        {
          kind:
            | 'resides_at'
            | 'owns'
            | 'tenant'
            | 'operator'
            | 'works_at'
            | 'hometown'
            | 'birthplace'
        }
      >,
    })
  }

  return projectCharacterRelationshipTargetRow({
    ...context,
    relationship: relationship as Extract<
      CharacterRelationshipEdge,
      { kind: 'parentOf' | 'partnerOf' | 'siblingOf' | 'mentorOf' | 'rivalOf' }
    >,
  })
}

export async function projectCharacterRelationships(
  relationships: readonly CharacterRelationshipEdge[],
  viewer: ViewerContext,
): Promise<CharacterRelationshipProjectionRow[]> {
  const rows = await Promise.all(
    relationships.map((relationship) => projectCharacterRelationshipRow(relationship, viewer)),
  )
  return rows.filter((row): row is CharacterRelationshipProjectionRow => row !== null)
}
