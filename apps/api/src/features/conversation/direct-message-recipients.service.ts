import type { CampaignRole } from '@rpg/contracts'
import { resolveCampaignViewerParticipation } from '@rpg/contracts'

import { findPcOwnerIdsByCharacterIds } from '../character'
import { CampaignMembershipModel } from '../campaign/campaign-membership.model'
import { listOpenParticipationsForCampaign } from '../campaign/participation/campaign-character-participation.repository'
import { resolveMemberOpenParticipatingCharacterIds } from '../campaign/participation/resolve-member-open-participating-character-ids.lib'
import { findUsersByIds } from '../user'
import {
  isEligibleDirectMessagePeerInSharedCampaign,
  type DirectMessageMembershipContext,
} from './direct-message-peer-eligibility.lib'

async function loadMembershipContextForCampaign(
  campaignId: string,
  userId: string,
): Promise<DirectMessageMembershipContext | null> {
  const membership = await CampaignMembershipModel.findOne({ campaignId, userId })
    .select('userId campaignRole controlledCharacterIds')
    .lean<{
      userId: string
      campaignRole: string
      controlledCharacterIds?: string[]
    } | null>()

  if (!membership) return null

  const role = membership.campaignRole as CampaignRole
  const controlledCharacterIds = membership.controlledCharacterIds ?? []
  const openParticipations = await listOpenParticipationsForCampaign(campaignId)
  const openParticipationCharacterIds = openParticipations.map(
    (participation) => participation.characterId,
  )
  const characterOwnerById = await findPcOwnerIdsByCharacterIds([
    ...new Set([...openParticipationCharacterIds, ...controlledCharacterIds]),
  ])
  const openParticipatingCharacterIds = resolveMemberOpenParticipatingCharacterIds({
    userId,
    controlledCharacterIds,
    openParticipationCharacterIds,
    characterOwnerById,
  })

  return {
    userId,
    role,
    participationState: resolveCampaignViewerParticipation({
      role,
      controlledCharacterIds,
      openParticipatingCharacterIds,
    }),
  }
}

export async function isEligibleDirectMessageRecipient(
  callerUserId: string,
  recipientUserId: string,
): Promise<boolean> {
  if (callerUserId === recipientUserId) return false

  const callerMemberships = await CampaignMembershipModel.find({ userId: callerUserId })
    .select('campaignId')
    .lean<{ campaignId: string }[]>()

  if (callerMemberships.length === 0) return false

  const sharedCampaignIds = callerMemberships.map((membership) => membership.campaignId)

  for (const campaignId of sharedCampaignIds) {
    const [callerContext, candidateContext] = await Promise.all([
      loadMembershipContextForCampaign(campaignId, callerUserId),
      loadMembershipContextForCampaign(campaignId, recipientUserId),
    ])

    if (!callerContext || !candidateContext) continue
    if (isEligibleDirectMessagePeerInSharedCampaign(callerContext, candidateContext)) {
      return true
    }
  }

  return false
}

export async function listDirectMessageRecipients(
  callerUserId: string,
): Promise<Array<{ userId: string; displayName: string }>> {
  const callerMemberships = await CampaignMembershipModel.find({ userId: callerUserId })
    .select('campaignId')
    .lean<{ campaignId: string }[]>()

  if (callerMemberships.length === 0) return []

  const recipientsByUserId = new Map<string, { userId: string; displayName: string }>()

  for (const { campaignId } of callerMemberships) {
    const memberships = await CampaignMembershipModel.find({ campaignId })
      .select('userId campaignRole controlledCharacterIds')
      .lean<
        {
          userId: string
          campaignRole: string
          controlledCharacterIds?: string[]
        }[]
      >()

    const callerMembership = memberships.find((membership) => membership.userId === callerUserId)
    if (!callerMembership) continue

    const callerContext = await loadMembershipContextForCampaign(campaignId, callerUserId)
    if (!callerContext) continue

    const openParticipations = await listOpenParticipationsForCampaign(campaignId)
    const openParticipationCharacterIds = openParticipations.map(
      (participation) => participation.characterId,
    )
    const relevantCharacterIds = [
      ...new Set([
        ...openParticipationCharacterIds,
        ...memberships.flatMap((membership) => membership.controlledCharacterIds ?? []),
      ]),
    ]
    const characterOwnerById = await findPcOwnerIdsByCharacterIds(relevantCharacterIds)

    for (const membership of memberships) {
      if (membership.userId === callerUserId) continue

      const role = membership.campaignRole as CampaignRole
      const controlledCharacterIds = membership.controlledCharacterIds ?? []
      const openParticipatingCharacterIds = resolveMemberOpenParticipatingCharacterIds({
        userId: membership.userId,
        controlledCharacterIds,
        openParticipationCharacterIds,
        characterOwnerById,
      })
      const candidateContext: DirectMessageMembershipContext = {
        userId: membership.userId,
        role,
        participationState: resolveCampaignViewerParticipation({
          role,
          controlledCharacterIds,
          openParticipatingCharacterIds,
        }),
      }

      if (!isEligibleDirectMessagePeerInSharedCampaign(callerContext, candidateContext)) continue
      recipientsByUserId.set(membership.userId, {
        userId: membership.userId,
        displayName: '',
      })
    }
  }

  if (recipientsByUserId.size === 0) return []

  const users = await findUsersByIds([...recipientsByUserId.keys()])
  const displayNameByUserId = new Map(users.map((user) => [user.id, user.displayName]))

  return [...recipientsByUserId.values()]
    .map((recipient) => ({
      userId: recipient.userId,
      displayName: displayNameByUserId.get(recipient.userId) ?? 'Unknown user',
    }))
    .sort((left, right) => left.displayName.localeCompare(right.displayName))
}
