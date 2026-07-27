import type { CompleteCampaignCharacterAssignmentResult } from '@rpg/contracts'
import type { ClientSession } from 'mongoose'

import { HttpError } from '../../lib/http-error'
import { areMongoTransactionsEnabled, runInTransaction } from '../../lib/mongo-transaction'
import { CampaignMembershipModel } from '../campaign/campaign-membership.model'
import { assignControlledPcToCampaignMember } from '../campaign/participation/assign-controlled-pc.service'
import {
  deleteAllParticipationsForCharacter,
  detachOpenParticipation,
} from '../campaign/participation/campaign-character-participation.repository'
import { createPcRecord, deletePcForUser } from '../character/character.repository'
import { findInviteById, markInviteCompleted } from './campaign-invite.repository'
import type { InviteCompletionWriteReceipt } from './complete-campaign-invite-receipt'

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

async function compensateInviteCompletionFromReceipt({
  receipt,
  campaignId,
  membershipId,
  userId,
}: {
  receipt: InviteCompletionWriteReceipt
  campaignId: string
  membershipId: string
  userId?: string
}): Promise<void> {
  if (receipt.addedControl) {
    await CampaignMembershipModel.updateOne(
      { _id: membershipId },
      { $pull: { controlledCharacterIds: receipt.characterId } },
    )
  }

  if (receipt.createdCharacter && userId) {
    await deleteAllParticipationsForCharacter(receipt.characterId)
    await deletePcForUser(receipt.characterId, userId)
    return
  }

  if (receipt.addedControl) {
    await detachOpenParticipation({ campaignId, characterId: receipt.characterId })
  }
}

async function runInviteCompletionAtomically({
  inviteId,
  campaignId,
  membershipId,
  characterId,
  receipt,
  compensate,
}: {
  inviteId: string
  campaignId: string
  membershipId: string
  characterId: string
  receipt: InviteCompletionWriteReceipt
  compensate?: (receipt: InviteCompletionWriteReceipt) => Promise<void>
}): Promise<InviteCompletionWriteReceipt> {
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
    return { ...receipt, addedControl: true, markedInviteCompleted: true }
  }

  try {
    await executeInviteCompletionWrites({ inviteId, campaignId, membershipId, characterId })
    return { ...receipt, addedControl: true, markedInviteCompleted: true }
  } catch (err) {
    await compensate?.({ ...receipt, addedControl: true, markedInviteCompleted: false })
    throw err
  }
}

export async function executeExistingCharacterInviteCompletion({
  inviteId,
  campaignId,
  membershipId,
  characterId,
}: {
  inviteId: string
  campaignId: string
  membershipId: string
  characterId: string
}): Promise<InviteCompletionWriteReceipt> {
  const receipt: InviteCompletionWriteReceipt = {
    characterId,
    createdCharacter: false,
    addedControl: false,
    markedInviteCompleted: false,
  }

  return runInviteCompletionAtomically({
    inviteId,
    campaignId,
    membershipId,
    characterId,
    receipt,
    compensate: (failedReceipt) =>
      compensateInviteCompletionFromReceipt({
        receipt: failedReceipt,
        campaignId,
        membershipId,
      }),
  })
}

export async function executeNewCharacterInviteCompletion({
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
}): Promise<CompleteCampaignCharacterAssignmentResult> {
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
  const receipt: InviteCompletionWriteReceipt = {
    characterId: character.id,
    createdCharacter: true,
    addedControl: false,
    markedInviteCompleted: false,
  }

  try {
    await executeInviteCompletionWrites({
      inviteId,
      campaignId,
      membershipId,
      characterId: character.id,
    })
  } catch (err) {
    await compensateInviteCompletionFromReceipt({
      receipt: { ...receipt, addedControl: true },
      campaignId,
      membershipId,
      userId,
    })
    throw err
  }

  return { campaignId, characterId: character.id }
}

// Legacy exports retained for any external callers during transition.
export const completeExistingCharacterInviteWrites = executeExistingCharacterInviteCompletion
export const completeNewCharacterInviteWrites = executeNewCharacterInviteCompletion
