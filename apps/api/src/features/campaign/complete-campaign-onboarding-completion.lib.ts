import type { CompleteCampaignOnboardingResult } from '@rpg/contracts'
import type { ClientSession } from 'mongoose'

import { areMongoTransactionsEnabled, runInTransaction } from '../../lib/mongo-transaction'
import { CampaignMembershipModel } from './campaign-membership.model'
import { assignControlledPcToCampaignMember } from './participation/assign-controlled-pc.service'
import {
  deleteAllParticipationsForCharacter,
  detachOpenParticipation,
} from './participation/campaign-character-participation.repository'
import { markInviteCompleted } from '../campaign-invite/campaign-invite.repository'
import { createPcRecord, deletePcForUser } from '../character/character.repository'
import type { InviteCompletionWriteReceipt } from '../campaign-invite/complete-campaign-invite-receipt'

async function executeOnboardingCompletionWrites({
  campaignId,
  membershipId,
  characterId,
  linkedInviteId,
  session,
}: {
  campaignId: string
  membershipId: string
  characterId: string
  linkedInviteId?: string | null
  session?: ClientSession
}): Promise<void> {
  await assignControlledPcToCampaignMember({
    campaignId,
    membershipId,
    characterId,
    session,
  })

  if (!linkedInviteId) return

  const completed = await markInviteCompleted(linkedInviteId, characterId, new Date(), { session })
  if (!completed && process.env.NODE_ENV !== 'production') {
    console.warn(
      `[campaign-onboarding] Linked invite ${linkedInviteId} was not marked completed during onboarding.`,
    )
  }
}

async function compensateOnboardingCompletionFromReceipt({
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

async function runOnboardingCompletionAtomically({
  campaignId,
  membershipId,
  characterId,
  linkedInviteId,
  receipt,
  compensate,
}: {
  campaignId: string
  membershipId: string
  characterId: string
  linkedInviteId?: string | null
  receipt: InviteCompletionWriteReceipt
  compensate?: (receipt: InviteCompletionWriteReceipt) => Promise<void>
}): Promise<InviteCompletionWriteReceipt> {
  if (areMongoTransactionsEnabled()) {
    await runInTransaction(async (session) => {
      await executeOnboardingCompletionWrites({
        campaignId,
        membershipId,
        characterId,
        linkedInviteId,
        session,
      })
    })
    return {
      ...receipt,
      addedControl: true,
      markedInviteCompleted: Boolean(linkedInviteId),
    }
  }

  try {
    await executeOnboardingCompletionWrites({
      campaignId,
      membershipId,
      characterId,
      linkedInviteId,
    })
    return {
      ...receipt,
      addedControl: true,
      markedInviteCompleted: Boolean(linkedInviteId),
    }
  } catch (err) {
    await compensate?.({ ...receipt, addedControl: true, markedInviteCompleted: false })
    throw err
  }
}

export async function executeExistingCharacterOnboardingCompletion({
  campaignId,
  membershipId,
  characterId,
  linkedInviteId,
}: {
  campaignId: string
  membershipId: string
  characterId: string
  linkedInviteId?: string | null
}): Promise<InviteCompletionWriteReceipt> {
  const receipt: InviteCompletionWriteReceipt = {
    characterId,
    createdCharacter: false,
    addedControl: false,
    markedInviteCompleted: false,
  }

  return runOnboardingCompletionAtomically({
    campaignId,
    membershipId,
    characterId,
    linkedInviteId,
    receipt,
    compensate: (failedReceipt) =>
      compensateOnboardingCompletionFromReceipt({
        receipt: failedReceipt,
        campaignId,
        membershipId,
      }),
  })
}

export async function executeNewCharacterOnboardingCompletion({
  campaignId,
  membershipId,
  userId,
  parsedInput,
  linkedInviteId,
}: {
  campaignId: string
  membershipId: string
  userId: string
  parsedInput: Parameters<typeof createPcRecord>[0]
  linkedInviteId?: string | null
}): Promise<CompleteCampaignOnboardingResult> {
  if (areMongoTransactionsEnabled()) {
    return runInTransaction(async (session) => {
      const character = await createPcRecord(parsedInput, userId, { session })
      await executeOnboardingCompletionWrites({
        campaignId,
        membershipId,
        characterId: character.id,
        linkedInviteId,
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
    await executeOnboardingCompletionWrites({
      campaignId,
      membershipId,
      characterId: character.id,
      linkedInviteId,
    })
  } catch (err) {
    await compensateOnboardingCompletionFromReceipt({
      receipt: { ...receipt, addedControl: true },
      campaignId,
      membershipId,
      userId,
    })
    throw err
  }

  return { campaignId, characterId: character.id }
}
