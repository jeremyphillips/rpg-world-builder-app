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

export type CampaignCharacterCompletionInvitePolicy =
  | { kind: 'invite'; inviteId: string }
  | { kind: 'onboarding'; linkedInviteId?: string | null }

export async function compensateCharacterCompletionFromReceipt({
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

async function executeCharacterCompletionWrites({
  campaignId,
  membershipId,
  characterId,
  invitePolicy,
  session,
}: {
  campaignId: string
  membershipId: string
  characterId: string
  invitePolicy: CampaignCharacterCompletionInvitePolicy
  session?: ClientSession
}): Promise<void> {
  if (invitePolicy.kind === 'invite') {
    const inviteInTx = await findInviteById(invitePolicy.inviteId, { session })
    if (!inviteInTx || inviteInTx.status !== 'accepted') {
      throw new HttpError(409, 'conflict', 'Invitation is not ready for onboarding.')
    }
  }

  await assignControlledPcToCampaignMember({
    campaignId,
    membershipId,
    characterId,
    session,
  })

  if (invitePolicy.kind === 'invite') {
    const completed = await markInviteCompleted(invitePolicy.inviteId, characterId, new Date(), {
      session,
    })
    if (!completed) {
      throw new HttpError(500, 'internal_error', 'Failed to complete invitation.')
    }
    return
  }

  if (!invitePolicy.linkedInviteId) return

  const completed = await markInviteCompleted(
    invitePolicy.linkedInviteId,
    characterId,
    new Date(),
    { session },
  )
  if (!completed && process.env.NODE_ENV !== 'production') {
    console.warn(
      `[campaign-onboarding] Linked invite ${invitePolicy.linkedInviteId} was not marked completed during onboarding.`,
    )
  }
}

function resolveMarkedInviteCompleted(
  invitePolicy: CampaignCharacterCompletionInvitePolicy,
): boolean {
  if (invitePolicy.kind === 'invite') return true
  return Boolean(invitePolicy.linkedInviteId)
}

async function runCharacterCompletionAtomically({
  campaignId,
  membershipId,
  characterId,
  invitePolicy,
  receipt,
  compensate,
}: {
  campaignId: string
  membershipId: string
  characterId: string
  invitePolicy: CampaignCharacterCompletionInvitePolicy
  receipt: InviteCompletionWriteReceipt
  compensate?: (receipt: InviteCompletionWriteReceipt) => Promise<void>
}): Promise<InviteCompletionWriteReceipt> {
  const markedInviteCompleted = resolveMarkedInviteCompleted(invitePolicy)

  if (areMongoTransactionsEnabled()) {
    await runInTransaction(async (session) => {
      await executeCharacterCompletionWrites({
        campaignId,
        membershipId,
        characterId,
        invitePolicy,
        session,
      })
    })
    return { ...receipt, addedControl: true, markedInviteCompleted }
  }

  try {
    await executeCharacterCompletionWrites({
      campaignId,
      membershipId,
      characterId,
      invitePolicy,
    })
    return { ...receipt, addedControl: true, markedInviteCompleted }
  } catch (err) {
    await compensate?.({ ...receipt, addedControl: true, markedInviteCompleted: false })
    throw err
  }
}

export async function executeExistingCharacterCompletion({
  campaignId,
  membershipId,
  characterId,
  invitePolicy,
}: {
  campaignId: string
  membershipId: string
  characterId: string
  invitePolicy: CampaignCharacterCompletionInvitePolicy
}): Promise<InviteCompletionWriteReceipt> {
  const receipt: InviteCompletionWriteReceipt = {
    characterId,
    createdCharacter: false,
    addedControl: false,
    markedInviteCompleted: false,
  }

  return runCharacterCompletionAtomically({
    campaignId,
    membershipId,
    characterId,
    invitePolicy,
    receipt,
    compensate: (failedReceipt) =>
      compensateCharacterCompletionFromReceipt({
        receipt: failedReceipt,
        campaignId,
        membershipId,
      }),
  })
}

export async function executeNewCharacterCompletion({
  campaignId,
  membershipId,
  userId,
  parsedInput,
  invitePolicy,
}: {
  campaignId: string
  membershipId: string
  userId: string
  parsedInput: Parameters<typeof createPcRecord>[0]
  invitePolicy: CampaignCharacterCompletionInvitePolicy
}): Promise<CompleteCampaignCharacterAssignmentResult> {
  if (areMongoTransactionsEnabled()) {
    return runInTransaction(async (session) => {
      const character = await createPcRecord(parsedInput, userId, { session })
      await executeCharacterCompletionWrites({
        campaignId,
        membershipId,
        characterId: character.id,
        invitePolicy,
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
    await executeCharacterCompletionWrites({
      campaignId,
      membershipId,
      characterId: character.id,
      invitePolicy,
    })
  } catch (err) {
    await compensateCharacterCompletionFromReceipt({
      receipt: { ...receipt, addedControl: true },
      campaignId,
      membershipId,
      userId,
    })
    throw err
  }

  return { campaignId, characterId: character.id }
}
