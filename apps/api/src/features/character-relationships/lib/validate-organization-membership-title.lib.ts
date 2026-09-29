import type { MembershipRelationshipDetails, Organization } from '@rpg/contracts'
import { assertOrganizationMembershipTitleIdBelongsToCatalog } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { HomebrewOrganizationModel } from '../../content/organizations/homebrew-organization.model'
import type { HomebrewDoc } from '../../content/lib/content-write-config'
import { toHomebrewOrganization } from '../../content/organizations/organizations.config'
import { CharacterRelationshipModel } from '../character-relationship.model'

export async function loadOrganizationMembershipTitleCatalog(
  organizationId: string,
): Promise<Organization['members']['titles']> {
  const doc = await HomebrewOrganizationModel.findById(organizationId).lean<HomebrewDoc | null>()
  if (!doc) {
    throw new HttpError(404, 'not_found', 'Organization not found.')
  }
  return toHomebrewOrganization(doc).members.titles
}

export async function loadOrganizationMembershipRelationshipEdges(
  organizationId: string,
): Promise<Array<{ details?: { membershipTitleId?: string } }>> {
  const records = await CharacterRelationshipModel.find({
    kind: 'organizationMembership',
    organizationId,
  })
    .select({ details: 1 })
    .lean<Array<{ details?: { membershipTitleId?: string } }>>()
  return records
}

export async function assertOrganizationMembershipTitleIdForRelationshipWrite(input: {
  organizationId: string
  details?: MembershipRelationshipDetails
}): Promise<void> {
  const membershipTitleId = input.details?.membershipTitleId?.trim()
  if (!membershipTitleId) {
    throw new HttpError(
      400,
      'invalid_membership_title',
      'Membership title id is required for organization memberships.',
    )
  }

  const catalog = await loadOrganizationMembershipTitleCatalog(input.organizationId)
  try {
    assertOrganizationMembershipTitleIdBelongsToCatalog({
      catalog,
      membershipTitleId,
    })
  } catch {
    throw new HttpError(
      400,
      'invalid_membership_title',
      'Membership title id is not in this organization catalog.',
    )
  }
}
