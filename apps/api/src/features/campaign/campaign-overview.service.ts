import type {
  CampaignOverviewMemberListItem,
  CampaignPartyPcListItem,
  CampaignRole,
} from '@rpg/contracts'
import { CAMPAIGN_ROLES } from '@rpg/contracts'

import { findPcsByIds } from '../character/character.repository'
import {
  buildCampaignContentEligibilityMap,
  formatInviteCharacterSummary,
} from '../campaign-invite/campaign-invite-eligibility.lib'
import { HttpError } from '../../lib/http-error'
import { findUsersByIds } from '../user/user.service'
import { CampaignMembershipModel } from './campaign-membership.model'
import { findCampaignById } from './find-campaign-by-id'
import { listOpenParticipationsForCampaign } from './participation/campaign-character-participation.repository'

const ROLE_SORT_ORDER = new Map<CampaignRole, number>(
  CAMPAIGN_ROLES.map((role, index) => [role, index]),
)

type MembershipRecord = {
  _id: unknown
  userId: string
  campaignRole: string
  controlledCharacterIds?: string[]
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

function resolveMemberOnboardingState(
  role: CampaignRole,
  controlledCharacterIds: string[],
): CampaignOverviewMemberListItem['onboardingState'] {
  if (role !== 'pc') return undefined
  return controlledCharacterIds.length > 0 ? 'character_added' : 'onboarding_incomplete'
}

export async function listCampaignMembersForOverview(
  campaignId: string,
): Promise<CampaignOverviewMemberListItem[]> {
  const memberships = await CampaignMembershipModel.find({ campaignId })
    .select('userId campaignRole controlledCharacterIds')
    .lean<MembershipRecord[]>()

  if (memberships.length === 0) return []

  const users = await findUsersByIds(memberships.map((membership) => membership.userId))
  const displayNameByUserId = new Map(users.map((user) => [user.id, user.displayName]))

  return memberships
    .map((membership) => {
      const role = membership.campaignRole as CampaignRole
      const controlledCharacterIds = membership.controlledCharacterIds ?? []

      return {
        id: String(membership._id),
        displayName: displayNameByUserId.get(membership.userId) ?? 'Unknown member',
        role,
        onboardingState: resolveMemberOnboardingState(role, controlledCharacterIds),
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

  const [participations, memberships, campaignContentById] = await Promise.all([
    listOpenParticipationsForCampaign(campaignId),
    CampaignMembershipModel.find({ campaignId })
      .select('userId controlledCharacterIds')
      .lean<MembershipRecord[]>(),
    buildCampaignContentEligibilityMap(campaignId),
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
    if (!controller) continue

    party.push({
      character: {
        id: character.id,
        name: character.name,
        summary: formatInviteCharacterSummary(character, campaignContentById),
        campaign: {
          id: campaignId,
          name: campaign.identity.name,
        },
      },
      member: {
        id: controller.membershipId,
        displayName: displayNameByUserId.get(controller.userId) ?? 'Unknown member',
      },
      roster: participation.roster,
    })
  }

  return party
}
