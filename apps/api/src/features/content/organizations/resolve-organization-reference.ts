import {
  canResolveSavedContentReference,
  type ContentViewer,
  type Organization,
  type OrganizationReferenceResolution,
} from '@rpg/contracts'

import { CharacterModel } from '../../character/character.model'
import { findOpenParticipation } from '../../campaign/participation/campaign-character-participation.repository'
import { HttpError } from '../../../lib/http-error'
import type { HomebrewDoc } from '../lib/content-write-config'
import { HomebrewOrganizationModel } from './homebrew-organization.model'
import { toHomebrewOrganization } from './organizations.config'

export type ResolveOrganizationReferenceInput = {
  campaignId: string
  organizationId: string
  characterId: string
  viewer: ContentViewer
}

/**
 * Resolves a saved character's organization reference independently of catalog
 * discovery. Authorized viewers retain readable draft or unavailable references.
 */
export async function resolveOrganizationReference({
  campaignId,
  organizationId,
  characterId,
  viewer,
}: ResolveOrganizationReferenceInput): Promise<Organization | null> {
  if (!canResolveSavedContentReference(viewer, { characterId })) {
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
  viewer,
}: Omit<ResolveOrganizationReferenceInput, 'organizationId'>): Promise<
  OrganizationReferenceResolution[] | null
> {
  if (!canResolveSavedContentReference(viewer, { characterId })) {
    throw new HttpError(403, 'forbidden', 'Not authorized to view this character reference.')
  }

  const participation = await findOpenParticipation({ campaignId, characterId })
  if (!participation) return null

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
