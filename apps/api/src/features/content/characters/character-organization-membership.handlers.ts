import type { Request, Response } from 'express'

import {
  createCharacterOrganizationMembershipInputSchema,
  updateCharacterOrganizationMembershipInputSchema,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { authorizeCampaignParticipantAccess } from '../../campaign'
import {
  createCharacterOrganizationMembershipRecord,
  deleteCharacterOrganizationMembershipRecord,
  updateCharacterOrganizationMembershipRecord,
} from './character-organization-membership-mutation'

function routeParams(req: Request): { campaignId: string; characterId: string } {
  return req.params as { campaignId: string; characterId: string }
}

function membershipRouteParams(req: Request): {
  campaignId: string
  characterId: string
  organizationId: string
} {
  return req.params as { campaignId: string; characterId: string; organizationId: string }
}

/**
 * Member-level routes + character-edit capability (PC canEdit / NPC manager via
 * resolveCampaignCharacterAccess). Differs from location-connection manager-only middleware.
 */
async function assertCanEditOrganizationMemberships(
  req: Request,
  characterId: string,
): Promise<{ campaignId: string; characterId: string }> {
  const { campaignId } = routeParams(req)
  const membership = req.campaignMembership
  if (!membership) {
    throw HttpError.forbidden('Not a member of this campaign')
  }

  const access = await authorizeCampaignParticipantAccess({
    campaignId,
    characterId,
    viewerUserId: req.user!.id,
    viewerRole: membership.campaignRole,
    viewerControlledCharacterIds: membership.pcCharacterIds,
  })

  if (!access.ok) {
    throw access.error
  }

  if (!access.context.capabilities.canEdit) {
    throw HttpError.forbidden(
      'You do not have permission to edit this character’s organization memberships.',
    )
  }

  return { campaignId, characterId }
}

export async function createCharacterOrganizationMembershipItem(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, characterId } = await assertCanEditOrganizationMemberships(
    req,
    routeParams(req).characterId,
  )
  const body = createCharacterOrganizationMembershipInputSchema.parse(req.body)

  const result = await createCharacterOrganizationMembershipRecord({
    campaignId,
    characterId,
    body,
  })

  res.status(201).json({ organizationMembership: result.membership })
}

export async function updateCharacterOrganizationMembershipItem(
  req: Request,
  res: Response,
): Promise<void> {
  const { campaignId, characterId } = await assertCanEditOrganizationMemberships(
    req,
    membershipRouteParams(req).characterId,
  )
  const { organizationId } = membershipRouteParams(req)
  const body = updateCharacterOrganizationMembershipInputSchema.parse(req.body)

  const result = await updateCharacterOrganizationMembershipRecord({
    campaignId,
    characterId,
    organizationId,
    body,
  })

  res.status(200).json({ organizationMembership: result.membership })
}

export async function deleteCharacterOrganizationMembershipItem(
  req: Request,
  res: Response,
): Promise<void> {
  const { characterId } = await assertCanEditOrganizationMemberships(
    req,
    membershipRouteParams(req).characterId,
  )
  const { organizationId } = membershipRouteParams(req)

  await deleteCharacterOrganizationMembershipRecord({
    characterId,
    organizationId,
  })

  res.status(200).json({ ok: true })
}
