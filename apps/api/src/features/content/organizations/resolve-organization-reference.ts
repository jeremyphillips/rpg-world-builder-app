import {
  canResolveSavedContentReference,
  type ContentViewer,
  type Organization,
  type OrganizationReferenceResolution,
} from '@rpg/contracts'

import { CharacterModel } from '../../character'
import { CharacterRelationshipModel } from '../../character-relationships/character-relationship.model'
import { HttpError } from '../../../lib/http-error'
import type { HomebrewDoc } from '../lib/content-write-config'
import { HomebrewOrganizationModel } from './homebrew-organization.model'
import { toHomebrewOrganization } from './organizations.config'

export type OrganizationReferenceAuthorization =
  | { source: 'campaign-character-access' }
  | { source: 'content-viewer'; viewer: ContentViewer }

export type ResolveOrganizationReferenceInput = {
  campaignId: string
  organizationId: string
  characterId: string
  authorization: OrganizationReferenceAuthorization
}

function isOrganizationReferenceAuthorized(
  authorization: OrganizationReferenceAuthorization,
  characterId: string,
): boolean {
  if (authorization.source === 'campaign-character-access') {
    return true
  }

  return canResolveSavedContentReference(authorization.viewer, { characterId })
}

/**
 * Resolves a saved character's organization reference independently of catalog
 * discovery. Callers must establish campaign sheet access or legacy viewer
 * authorization before invoking.
 */
export async function resolveOrganizationReference({
  campaignId,
  organizationId,
  characterId,
  authorization,
}: ResolveOrganizationReferenceInput): Promise<Organization | null> {
  if (!isOrganizationReferenceAuthorized(authorization, characterId)) {
    throw new HttpError(403, 'forbidden', 'Not authorized to view this character reference.')
  }

  const doc = await HomebrewOrganizationModel.findOne({
    _id: organizationId,
    campaignId,
  }).lean<HomebrewDoc>()

  return doc ? toHomebrewOrganization(doc) : null
}

export async function resolveCharacterOrganizationReferences({
  campaignId,
  characterId,
  authorization,
}: Omit<ResolveOrganizationReferenceInput, 'organizationId'>): Promise<
  OrganizationReferenceResolution[] | null
> {
  if (!isOrganizationReferenceAuthorized(authorization, characterId)) {
    throw new HttpError(403, 'forbidden', 'Not authorized to view this character reference.')
  }

  const characterExists = await CharacterModel.exists({ _id: characterId })
  if (!characterExists) return null

  const edges = await CharacterRelationshipModel.find({
    campaignId,
    characterId,
    kind: 'organizationMembership',
  })
    .select({ organizationId: 1, details: 1 })
    .lean<Array<{ organizationId?: string; details?: { title?: string; priority?: number } }>>()

  if (edges.length === 0) return []

  const references = edges.flatMap((edge) => {
    if (!edge.organizationId) return []
    const title = edge.details?.title
    const priority = edge.details?.priority
    return [
      {
        organizationId: edge.organizationId,
        ...(title !== undefined ? { title } : {}),
        ...(priority !== undefined ? { priority } : {}),
      },
    ]
  })

  const ids = references.map(({ organizationId }) => organizationId)
  const docs = await HomebrewOrganizationModel.find({
    _id: { $in: ids },
    campaignId,
  }).lean<HomebrewDoc[]>()
  const organizationsById = new Map(
    docs.map((doc) => {
      const organization = toHomebrewOrganization(doc)
      return [organization.id, organization]
    }),
  )

  return references
    .map(({ organizationId, title, priority }) => ({
      organizationId,
      ...(title !== undefined ? { title } : {}),
      ...(priority !== undefined ? { priority } : {}),
      organization: organizationsById.get(organizationId) ?? null,
    }))
    .sort((left, right) => {
      const leftResolved = left.organization ? 0 : 1
      const rightResolved = right.organization ? 0 : 1
      if (leftResolved !== rightResolved) return leftResolved - rightResolved
      return left.organizationId.localeCompare(right.organizationId)
    })
}
