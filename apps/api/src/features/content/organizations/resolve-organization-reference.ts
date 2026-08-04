import {
  canResolveSavedContentReference,
  type ContentViewer,
  type Organization,
  type OrganizationReferenceResolution,
} from '@rpg/contracts'

import { CharacterModel } from '../../character'
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

  const character = await CharacterModel.findById(characterId)
    .select({ connections: 1 })
    .lean<{ connections?: { organizations?: { organizationId: string }[] } } | null>()
  if (!character) return null

  const references = character.connections?.organizations ?? []
  if (references.length === 0) return []

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

  return ids.map((organizationId) => ({
    organizationId,
    organization: organizationsById.get(organizationId) ?? null,
  }))
}
