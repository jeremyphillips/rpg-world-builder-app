import type { CampaignCharacterListItem, CampaignRole } from '@rpg/contracts'
import { isCampaignManager } from '@rpg/contracts'

import { findPcsByIds } from '../character'
import { buildCharacterCardSummaryDto } from '../character/lib/build-character-card-summary-dto.lib'
import { HttpError } from '../../lib/http-error'
import { buildCampaignContentEligibilityIndex } from '../campaign-invite'
import { findUsersByIds } from '../user'
import { CampaignMembershipModel } from './campaign-membership.model'
import { findCampaignById } from './find-campaign-by-id'
import { listOpenParticipationsForCampaign } from './participation/campaign-character-participation.repository'

type MembershipRecord = {
  _id: unknown
  userId: string
  controlledCharacterIds?: string[]
}

function buildControllerByCharacterId(
  memberships: MembershipRecord[],
): Map<string, { membershipId: string; userId: string }> {
  const controllerByCharacterId = new Map<string, { membershipId: string; userId: string }>()

  for (const membership of memberships) {
    for (const characterId of membership.controlledCharacterIds ?? []) {
      controllerByCharacterId.set(characterId, {
        membershipId: String(membership._id),
        userId: membership.userId,
      })
    }
  }

  return controllerByCharacterId
}

export async function listCampaignCharactersForViewer(input: {
  campaignId: string
  viewerRole: CampaignRole
  viewerControlledCharacterIds: readonly string[]
}): Promise<CampaignCharacterListItem[]> {
  const { campaignId, viewerRole, viewerControlledCharacterIds } = input

  if (viewerRole === 'observer') {
    throw new HttpError(403, 'forbidden', 'You do not have permission to view this character.')
  }

  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'campaign_not_found', 'Campaign not found.')
  }

  const [participations, memberships, contentIndex] = await Promise.all([
    listOpenParticipationsForCampaign(campaignId),
    CampaignMembershipModel.find({ campaignId })
      .select('userId controlledCharacterIds')
      .lean<MembershipRecord[]>(),
    buildCampaignContentEligibilityIndex(campaignId),
  ])

  if (participations.length === 0) return []

  const controllerByCharacterId = buildControllerByCharacterId(memberships)
  const viewerIsManager = isCampaignManager(viewerRole)

  const visibleParticipations = participations.filter((participation) => {
    if (participation.roster.status === 'retired') return false
    if (viewerIsManager) return true
    return viewerControlledCharacterIds.includes(participation.characterId)
  })

  if (visibleParticipations.length === 0) return []

  const pcIds = visibleParticipations.map((participation) => participation.characterId)
  const pcs = await findPcsByIds(pcIds)
  const pcById = new Map(pcs.map((pc) => [pc.id, pc]))
  const users = await findUsersByIds([
    ...new Set([...controllerByCharacterId.values()].map((entry) => entry.userId)),
  ])
  const displayNameByUserId = new Map(users.map((user) => [user.id, user.displayName]))

  const characters: CampaignCharacterListItem[] = []

  for (const participation of visibleParticipations) {
    const character = pcById.get(participation.characterId)
    if (!character) continue

    const controller = controllerByCharacterId.get(participation.characterId)

    characters.push({
      character: {
        ...buildCharacterCardSummaryDto({ character, contentIndex }),
        campaign: {
          id: campaignId,
          name: campaign.identity.name,
        },
      },
      controller: controller
        ? {
            membershipId: controller.membershipId,
            displayName: displayNameByUserId.get(controller.userId) ?? 'Unknown member',
          }
        : null,
      roster: participation.roster,
    })
  }

  return characters
}
