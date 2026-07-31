import type { CampaignRole } from '@rpg/contracts'
import { resolveCampaignViewerParticipation } from '@rpg/contracts'
import { isValidObjectId } from 'mongoose'

import { CampaignModel } from '../campaign/campaign.model'
import { CampaignMembershipModel } from '../campaign/campaign-membership.model'
import { listOpenParticipationsForCampaign } from '../campaign/participation/campaign-character-participation.repository'
import { resolveMemberOpenParticipatingCharacterIds } from '../campaign/participation/resolve-member-open-participating-character-ids.lib'
import { findPcOwnerIdsByCharacterIds } from '../character'
import {
  isEligibleDirectMessagePeerInSharedCampaign,
  type DirectMessageMembershipContext,
} from './direct-message-peer-eligibility.lib'

type CampaignMembershipRecord = {
  userId: string
  campaignRole: string
  controlledCharacterIds?: string[]
}

export type DirectMessageCampaignBundle = {
  campaignId: string
  campaignName: string
  viewerContext: DirectMessageMembershipContext
  membershipContextsByUserId: Map<string, DirectMessageMembershipContext>
}

function buildMembershipContextForCampaign(
  membership: CampaignMembershipRecord,
  openParticipationCharacterIds: string[],
  characterOwnerById: Map<string, string>,
): DirectMessageMembershipContext {
  const role = membership.campaignRole as CampaignRole
  const controlledCharacterIds = membership.controlledCharacterIds ?? []
  const openParticipatingCharacterIds = resolveMemberOpenParticipatingCharacterIds({
    userId: membership.userId,
    controlledCharacterIds,
    openParticipationCharacterIds,
    characterOwnerById,
  })

  return {
    userId: membership.userId,
    role,
    participationState: resolveCampaignViewerParticipation({
      role,
      controlledCharacterIds,
      openParticipatingCharacterIds,
    }),
  }
}

export async function loadDirectMessageCampaignBundles(
  viewerUserId: string,
): Promise<DirectMessageCampaignBundle[]> {
  const viewerMemberships = await CampaignMembershipModel.find({ userId: viewerUserId })
    .select('campaignId')
    .lean<{ campaignId: string }[]>()

  const campaignIds = viewerMemberships
    .map((membership) => membership.campaignId)
    .filter((campaignId) => isValidObjectId(campaignId))

  if (campaignIds.length === 0) return []

  const [campaignDocs, memberships] = await Promise.all([
    CampaignModel.find({ _id: { $in: campaignIds } })
      .select('identity.name')
      .lean<{ _id: unknown; identity: { name: string } }[]>(),
    CampaignMembershipModel.find({ campaignId: { $in: campaignIds } })
      .select('campaignId userId campaignRole controlledCharacterIds')
      .lean<(CampaignMembershipRecord & { campaignId: string })[]>(),
  ])

  const campaignNameById = new Map(campaignDocs.map((doc) => [String(doc._id), doc.identity.name]))
  const membershipsByCampaignId = new Map<
    string,
    (CampaignMembershipRecord & { campaignId: string })[]
  >()

  for (const membership of memberships) {
    const list = membershipsByCampaignId.get(membership.campaignId) ?? []
    list.push(membership)
    membershipsByCampaignId.set(membership.campaignId, list)
  }

  const bundles: DirectMessageCampaignBundle[] = []

  for (const campaignId of campaignIds) {
    const campaignMemberships = membershipsByCampaignId.get(campaignId) ?? []
    const viewerMembership = campaignMemberships.find(
      (membership) => membership.userId === viewerUserId,
    )
    if (!viewerMembership) continue

    const openParticipations = await listOpenParticipationsForCampaign(campaignId)
    const openParticipationCharacterIds = openParticipations.map(
      (participation) => participation.characterId,
    )
    const relevantCharacterIds = [
      ...new Set([
        ...openParticipationCharacterIds,
        ...campaignMemberships.flatMap((membership) => membership.controlledCharacterIds ?? []),
      ]),
    ]
    const characterOwnerById = await findPcOwnerIdsByCharacterIds(relevantCharacterIds)

    const viewerContext = buildMembershipContextForCampaign(
      viewerMembership,
      openParticipationCharacterIds,
      characterOwnerById,
    )

    const membershipContextsByUserId = new Map<string, DirectMessageMembershipContext>()
    for (const membership of campaignMemberships) {
      membershipContextsByUserId.set(
        membership.userId,
        buildMembershipContextForCampaign(
          membership,
          openParticipationCharacterIds,
          characterOwnerById,
        ),
      )
    }

    bundles.push({
      campaignId,
      campaignName: campaignNameById.get(campaignId) ?? 'Unknown campaign',
      viewerContext,
      membershipContextsByUserId,
    })
  }

  return bundles
}

export function isEligibleDirectMessagePeerInCampaignBundle(
  bundle: DirectMessageCampaignBundle,
  peerUserId: string,
): boolean {
  const peerContext = bundle.membershipContextsByUserId.get(peerUserId)
  if (!peerContext) return false
  return isEligibleDirectMessagePeerInSharedCampaign(bundle.viewerContext, peerContext)
}
