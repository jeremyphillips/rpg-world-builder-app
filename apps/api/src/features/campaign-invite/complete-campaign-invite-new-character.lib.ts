import type { CampaignInvite, Character, CreateCharacterInput } from '@rpg/contracts'
import {
  createCharacterInputSchema,
  createDefaultCharacterVitalState,
  resolveCharacterCampaignEligibility,
} from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { findCampaignById } from '../campaign/find-campaign-by-id'
import { getRulesetPatchRead } from '../vocabulary'
import { buildCampaignContentEligibilityMap } from './campaign-invite-eligibility.lib'
import { findCampaignMembershipByCampaignAndUser } from './create-or-confirm-player-membership'

async function loadInviteStartingLevel(campaignId: string): Promise<number> {
  const patch = await getRulesetPatchRead(campaignId)
  return patch?.characterCreation.startingLevel ?? 1
}

export async function resolveCompletedInviteForNewCharacter({
  invite,
  userId,
}: {
  invite: CampaignInvite
  userId: string
}): Promise<CompleteCampaignInviteResult | null> {
  if (invite.status !== 'completed') return null

  if (invite.acceptedByUserId !== userId) {
    throw new HttpError(403, 'forbidden', 'This invitation belongs to another user.')
  }

  if (!invite.completedCharacterId) {
    throw new HttpError(409, 'conflict', 'This invitation was already completed.')
  }

  return { campaignId: invite.campaignId, characterId: invite.completedCharacterId }
}

export type CompleteCampaignInviteResult = {
  campaignId: string
  characterId: string
}

export async function validateNewCharacterInviteInput({
  acceptedInvite,
  userId,
  characterCreateInput,
}: {
  acceptedInvite: CampaignInvite
  userId: string
  characterCreateInput: CreateCharacterInput
}): Promise<{
  parsedInput: CreateCharacterInput
  membershipId: string
}> {
  const parsedInput = createCharacterInputSchema.parse(characterCreateInput)
  const campaign = await findCampaignById(acceptedInvite.campaignId)

  if (!campaign) {
    throw new HttpError(500, 'integrity_error', 'Campaign for this invitation no longer exists.')
  }

  if (parsedInput.rulesetId !== campaign.rulesetId) {
    throw HttpError.badRequest('rulesetId must match the campaign ruleset.')
  }

  if (parsedInput.characterType !== 'pc') {
    throw HttpError.badRequest('Only player characters can be created for campaign onboarding.')
  }

  const [campaignContentById, startingLevel, membership] = await Promise.all([
    buildCampaignContentEligibilityMap(acceptedInvite.campaignId),
    loadInviteStartingLevel(acceptedInvite.campaignId),
    findCampaignMembershipByCampaignAndUser(acceptedInvite.campaignId, userId),
  ])

  if (!membership) {
    throw new HttpError(
      500,
      'integrity_error',
      'Accepted invitation is missing the expected campaign membership.',
    )
  }

  const now = new Date().toISOString()
  const validationCharacter: Character = {
    ...parsedInput,
    id: 'invite-validation',
    userId,
    vital: createDefaultCharacterVitalState(),
    createdAt: now,
    updatedAt: now,
  }

  const eligibility = resolveCharacterCampaignEligibility({
    character: validationCharacter,
    userId,
    campaignId: acceptedInvite.campaignId,
    startingLevel,
    existingOpenParticipation: null,
    campaignContentById,
    viewer: { kind: 'none' },
  })

  if (!eligibility.eligible) {
    throw new HttpError(
      422,
      'ineligible_character',
      'Character build is not eligible for this campaign.',
      {
        blockingIssues: eligibility.blockingIssues,
      },
    )
  }

  return { parsedInput, membershipId: String(membership._id) }
}
