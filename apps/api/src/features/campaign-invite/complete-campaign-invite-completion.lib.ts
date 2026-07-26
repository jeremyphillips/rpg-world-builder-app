import type { CampaignInvite, CompleteCampaignInviteResult } from '@rpg/contracts'
import { resolveCharacterCampaignEligibility } from '@rpg/contracts'
import type { ClientSession } from 'mongoose'

import { HttpError } from '../../lib/http-error'
import { areMongoTransactionsEnabled, runInTransaction } from '../../lib/mongo-transaction'
import { CampaignMembershipModel } from '../campaign/campaign-membership.model'
import { findCampaignById } from '../campaign/find-campaign-by-id'
import { assignControlledPcToCampaignMember } from '../campaign/participation/assign-controlled-pc.service'
import {
  deleteAllParticipationsForCharacter,
  detachOpenParticipation,
  findOpenParticipationForCharacter,
} from '../campaign/participation/campaign-character-participation.repository'
import { createPcRecord, deletePcForUser } from '../character/character.repository'
import { findCharacterForUser } from '../character/character.service'
import { getRulesetPatchRead } from '../vocabulary'
import { buildCampaignContentEligibilityMap } from './campaign-invite-eligibility.lib'
import { findInviteById, markInviteCompleted } from './campaign-invite.repository'
import { findCampaignMembershipByCampaignAndUser } from './create-or-confirm-player-membership'

async function loadInviteStartingLevel(campaignId: string): Promise<number> {
  const patch = await getRulesetPatchRead(campaignId)
  return patch?.characterCreation.startingLevel ?? 1
}

export async function resolveCompletedInviteForExistingCharacter({
  invite,
  userId,
  characterId,
}: {
  invite: CampaignInvite
  userId: string
  characterId: string
}): Promise<CompleteCampaignInviteResult | null> {
  if (invite.status !== 'completed') return null

  if (invite.acceptedByUserId !== userId) {
    throw new HttpError(403, 'forbidden', 'This invitation belongs to another user.')
  }

  if (invite.completedCharacterId === characterId) {
    return { campaignId: invite.campaignId, characterId }
  }

  throw new HttpError(
    409,
    'conflict',
    'This invitation was already completed with a different character.',
  )
}

export async function validateExistingCharacterInviteCompletion({
  acceptedInvite,
  userId,
  characterId,
}: {
  acceptedInvite: CampaignInvite
  userId: string
  characterId: string
}): Promise<{ membershipId: string }> {
  const character = await findCharacterForUser(characterId, userId)
  if (!character) {
    throw new HttpError(404, 'not_found', 'Character not found.')
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

  const existingOpenParticipation = await findOpenParticipationForCharacter(characterId)
  let conflictingCampaignName: string | undefined
  if (
    existingOpenParticipation &&
    existingOpenParticipation.campaignId !== acceptedInvite.campaignId
  ) {
    const conflictingCampaign = await findCampaignById(existingOpenParticipation.campaignId)
    conflictingCampaignName = conflictingCampaign?.identity.name
  }

  const eligibility = resolveCharacterCampaignEligibility({
    character,
    userId,
    campaignId: acceptedInvite.campaignId,
    startingLevel,
    existingOpenParticipation,
    conflictingCampaignName,
    campaignContentById,
    viewer: { kind: 'pc', characterIds: [character.id] },
  })

  if (!eligibility.eligible) {
    throw new HttpError(
      422,
      'ineligible_character',
      'Character is not eligible for this campaign.',
      {
        blockingIssues: eligibility.blockingIssues,
      },
    )
  }

  return { membershipId: String(membership._id) }
}

async function executeInviteCompletionWrites({
  inviteId,
  campaignId,
  membershipId,
  characterId,
  session,
}: {
  inviteId: string
  campaignId: string
  membershipId: string
  characterId: string
  session?: ClientSession
}): Promise<void> {
  const inviteInTx = await findInviteById(inviteId, { session })
  if (!inviteInTx || inviteInTx.status !== 'accepted') {
    throw new HttpError(409, 'conflict', 'Invitation is not ready for onboarding.')
  }

  await assignControlledPcToCampaignMember({
    campaignId,
    membershipId,
    characterId,
    session,
  })

  const completed = await markInviteCompleted(inviteId, characterId, new Date(), { session })
  if (!completed) {
    throw new HttpError(500, 'internal_error', 'Failed to complete invitation.')
  }
}

async function compensateInviteExistingCharacterCompletion({
  characterId,
  campaignId,
  membershipId,
}: {
  characterId: string
  campaignId: string
  membershipId: string
}): Promise<void> {
  await CampaignMembershipModel.updateOne(
    { _id: membershipId },
    { $pull: { controlledCharacterIds: characterId } },
  )
  await detachOpenParticipation({ campaignId, characterId })
}

async function compensateInviteNewCharacterCompletion({
  characterId,
  userId,
  membershipId,
}: {
  characterId: string
  userId: string
  membershipId: string
}): Promise<void> {
  await CampaignMembershipModel.updateOne(
    { _id: membershipId },
    { $pull: { controlledCharacterIds: characterId } },
  )
  await deleteAllParticipationsForCharacter(characterId)
  await deletePcForUser(characterId, userId)
}

async function runInviteCompletionAtomically({
  inviteId,
  campaignId,
  membershipId,
  characterId,
  compensate,
}: {
  inviteId: string
  campaignId: string
  membershipId: string
  characterId: string
  compensate?: () => Promise<void>
}): Promise<void> {
  if (areMongoTransactionsEnabled()) {
    await runInTransaction(async (session) => {
      await executeInviteCompletionWrites({
        inviteId,
        campaignId,
        membershipId,
        characterId,
        session,
      })
    })
    return
  }

  try {
    await executeInviteCompletionWrites({ inviteId, campaignId, membershipId, characterId })
  } catch (err) {
    await compensate?.()
    throw err
  }
}

export async function completeExistingCharacterInviteWrites({
  inviteId,
  campaignId,
  membershipId,
  characterId,
}: {
  inviteId: string
  campaignId: string
  membershipId: string
  characterId: string
}): Promise<void> {
  await runInviteCompletionAtomically({
    inviteId,
    campaignId,
    membershipId,
    characterId,
    compensate: () =>
      compensateInviteExistingCharacterCompletion({ characterId, campaignId, membershipId }),
  })
}

export async function completeNewCharacterInviteWrites({
  inviteId,
  campaignId,
  membershipId,
  userId,
  parsedInput,
}: {
  inviteId: string
  campaignId: string
  membershipId: string
  userId: string
  parsedInput: Parameters<typeof createPcRecord>[0]
}): Promise<CompleteCampaignInviteResult> {
  if (areMongoTransactionsEnabled()) {
    return runInTransaction(async (session) => {
      const character = await createPcRecord(parsedInput, userId, { session })
      await executeInviteCompletionWrites({
        inviteId,
        campaignId,
        membershipId,
        characterId: character.id,
        session,
      })
      return { campaignId, characterId: character.id }
    })
  }

  const character = await createPcRecord(parsedInput, userId)

  try {
    await executeInviteCompletionWrites({
      inviteId,
      campaignId,
      membershipId,
      characterId: character.id,
    })
  } catch (err) {
    await compensateInviteNewCharacterCompletion({
      characterId: character.id,
      userId,
      membershipId,
    })
    throw err
  }

  return { campaignId, characterId: character.id }
}
