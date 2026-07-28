import type { CompleteCampaignCharacterAssignmentResult } from '@rpg/contracts'
import type { ClientSession } from 'mongoose'

import { areMongoTransactionsEnabled, runInTransaction } from '../../../../lib/mongo-transaction'
import { CampaignMembershipModel } from '../../campaign-membership.model'
import { warnCampaignOnboardingInviteAuditFailed } from '../../campaign-onboarding-observability.lib'
import { markInviteCompleted } from '../../../campaign-invite/campaign-invite.repository'
import { assignControlledPcToCampaignMember } from '../assign-controlled-pc.service'
import {
  deleteAllParticipationsForCharacter,
  detachOpenParticipation,
} from '../campaign-character-participation.repository'
import { createPcRecord, deletePcForUser } from '../../../character/character.repository'
import type { CharacterAssignmentWriteReceipt } from './character-assignment-write-receipt'

export type CampaignCharacterCompletionInvitePolicy = {
  linkedInviteId?: string | null
}

export async function compensateCharacterCompletionFromReceipt({
  receipt,
  campaignId,
  membershipId,
  userId,
}: {
  receipt: CharacterAssignmentWriteReceipt
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
  await assignControlledPcToCampaignMember({
    campaignId,
    membershipId,
    characterId,
    session,
  })

  if (!invitePolicy.linkedInviteId) return

  const completed = await markInviteCompleted(
    invitePolicy.linkedInviteId,
    characterId,
    new Date(),
    { session },
  )
  if (!completed) {
    warnCampaignOnboardingInviteAuditFailed({
      campaignId,
      linkedInviteId: invitePolicy.linkedInviteId,
      characterId,
    })
  }
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
  receipt: CharacterAssignmentWriteReceipt
  compensate?: (receipt: CharacterAssignmentWriteReceipt) => Promise<void>
}): Promise<CharacterAssignmentWriteReceipt> {
  const markedInviteCompleted = Boolean(invitePolicy.linkedInviteId)

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
}): Promise<CharacterAssignmentWriteReceipt> {
  const receipt: CharacterAssignmentWriteReceipt = {
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
  const receipt: CharacterAssignmentWriteReceipt = {
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
