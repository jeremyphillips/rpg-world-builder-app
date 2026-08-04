import type {
  CampaignOverviewMemberListItem,
  CampaignPartyPcListItem,
  CampaignRole,
} from '@rpg/contracts'
import { CAMPAIGN_ROLES } from '@rpg/contracts'

import { findPcsByIds, findPcOwnerIdsByCharacterIds } from '../character'
import { buildCharacterCardSummaryDto } from '../character'
import { buildCampaignContentEligibilityIndex } from '../campaign-invite'
import { findUsersByIds } from '../user'
import { HttpError } from '../../lib/http-error'
import { CampaignMembershipModel } from './campaign-membership.model'
import { findCampaignById } from './find-campaign-by-id'
import { listOpenParticipationsForCampaign } from './participation/campaign-character-participation.repository'
import { resolveCampaignMemberOnboardingState } from './participation/resolve-member-open-participating-character-ids.lib'

const ROLE_SORT_ORDER = new Map<CampaignRole, number>(
  CAMPAIGN_ROLES.map((role, index) => [role, index]),
)

type MembershipRecord = {
  _id: unknown
  userId: string
  campaignRole: string
  controlledCharacterIds?: string[]
  joinedAt?: Date
}

function sortMembers(
  left: CampaignOverviewMemberListItem,
  right: CampaignOverviewMemberListItem,
): number {
  const roleDelta =
    (ROLE_SORT_ORDER.get(left.role) ?? Number.MAX_SAFE_INTEGER) -
    (ROLE_SORT_ORDER.get(right.role) ?? Number.MAX_SAFE_INTEGER)
  if (roleDelta !== 0) return roleDelta
  return left.displayName.localeCompare(right.displayName)
}

export async function listCampaignMembersForOverview(
  campaignId: string,
  options?: { excludeUserId?: string },
): Promise<CampaignOverviewMemberListItem[]> {
  const memberships = await CampaignMembershipModel.find({ campaignId })
    .select('userId campaignRole controlledCharacterIds joinedAt')
    .lean<MembershipRecord[]>()

  if (memberships.length === 0) return []

  const visibleMemberships = options?.excludeUserId
    ? memberships.filter((membership) => membership.userId !== options.excludeUserId)
    : memberships

  if (visibleMemberships.length === 0) return []

  const [users, openParticipations] = await Promise.all([
    findUsersByIds(visibleMemberships.map((membership) => membership.userId)),
    listOpenParticipationsForCampaign(campaignId),
  ])
  const displayNameByUserId = new Map(users.map((user) => [user.id, user.displayName]))
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

  return visibleMemberships
    .map((membership) => {
      const role = membership.campaignRole as CampaignRole
      const controlledCharacterIds = membership.controlledCharacterIds ?? []
      const onboardingState = resolveCampaignMemberOnboardingState({
        userId: membership.userId,
        role,
        controlledCharacterIds,
        openParticipationCharacterIds,
        characterOwnerById,
      })

      return {
        id: String(membership._id),
        displayName: displayNameByUserId.get(membership.userId) ?? 'Unknown member',
        role,
        onboardingState,
        ...(onboardingState === 'onboarding_incomplete' && membership.joinedAt
          ? { inviteAcceptedAt: membership.joinedAt.toISOString() }
          : {}),
      }
    })
    .sort(sortMembers)
}

export async function listCampaignPartyForOverview(
  campaignId: string,
): Promise<CampaignPartyPcListItem[]> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const [participations, memberships, contentIndex] = await Promise.all([
    listOpenParticipationsForCampaign(campaignId),
    CampaignMembershipModel.find({ campaignId })
      .select('userId controlledCharacterIds')
      .lean<MembershipRecord[]>(),
    buildCampaignContentEligibilityIndex(campaignId),
  ])

  if (participations.length === 0) return []

  const controllerByCharacterId = new Map<string, { membershipId: string; userId: string }>()
  for (const membership of memberships) {
    for (const characterId of membership.controlledCharacterIds ?? []) {
      controllerByCharacterId.set(characterId, {
        membershipId: String(membership._id),
        userId: membership.userId,
      })
    }
  }

  const pcIds = participations.map((participation) => participation.characterId)
  const pcs = await findPcsByIds(pcIds)
  const pcById = new Map(pcs.map((pc) => [pc.id, pc]))
  const users = await findUsersByIds([
    ...new Set([...controllerByCharacterId.values()].map((entry) => entry.userId)),
  ])
  const displayNameByUserId = new Map(users.map((user) => [user.id, user.displayName]))

  const party: CampaignPartyPcListItem[] = []

  for (const participation of participations) {
    if (participation.roster.status === 'retired') continue

    const character = pcById.get(participation.characterId)
    if (!character) continue

    const controller = controllerByCharacterId.get(participation.characterId)

    party.push({
      character: {
        ...buildCharacterCardSummaryDto({ character, contentIndex }),
        campaign: {
          id: campaignId,
          name: campaign.identity.name,
        },
      },
      member: controller
        ? {
            id: controller.membershipId,
            displayName: displayNameByUserId.get(controller.userId) ?? 'Unknown member',
          }
        : null,
      roster: participation.roster,
    })
  }

  return party
}
