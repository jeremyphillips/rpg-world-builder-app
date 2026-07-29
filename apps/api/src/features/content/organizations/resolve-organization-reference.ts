import {
  canResolveSavedContentReference,
  type ContentViewer,
  type Organization,
} from '@rpg/contracts'

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
