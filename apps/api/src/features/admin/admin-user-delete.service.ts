import { deleteCharacterForUser, listCharactersForUser } from '../character'
import { CampaignMembershipModel } from '../campaign'
import { CampaignInviteModel } from '../campaign-invite'
import { UserModel, type UserWithActivityTimestamps } from '../user'

import {
  buildAdminUserDeletionPreview,
  canDeleteUser,
  computeDeleteBlockers,
} from './admin-user-summary.service'

export async function deleteAdminUser(
  targetUser: UserWithActivityTimestamps,
  actor: { id: string; role: UserWithActivityTimestamps['role'] },
): Promise<
  | { deleted: true }
  | { deleted: false; blockers: Awaited<ReturnType<typeof computeDeleteBlockers>> }
> {
  const blockers = await computeDeleteBlockers({
    actorId: actor.id,
    actorRole: actor.role,
    targetUserId: targetUser.id,
    targetRole: targetUser.role,
  })

  if (!canDeleteUser(blockers)) {
    return { deleted: false, blockers }
  }

  const characters = await listCharactersForUser(targetUser.id)
  for (const character of characters) {
    const result = await deleteCharacterForUser(character.id, targetUser.id)
    if (result.status === 'blocked') {
      return { deleted: false, blockers: ['character_referenced_by_locations'] }
    }
    if (result.status !== 'deleted') {
      throw new Error(`Failed to delete character ${character.id} for user ${targetUser.id}`)
    }
  }

  await CampaignMembershipModel.deleteMany({
    userId: targetUser.id,
    campaignRole: { $in: ['co-owner', 'pc', 'observer'] },
  })

  const normalizedEmail = targetUser.email.toLowerCase()
  await CampaignInviteModel.deleteMany({
    $or: [
      { normalizedEmail, status: 'pending' },
      { acceptedByUserId: targetUser.id, status: 'accepted' },
    ],
  })

  await UserModel.deleteOne({ _id: targetUser.id })

  return { deleted: true }
}

export async function getAdminUserDeletionPreview(
  targetUser: UserWithActivityTimestamps,
  actor: { id: string; role: UserWithActivityTimestamps['role'] },
) {
  return buildAdminUserDeletionPreview(targetUser, actor)
}
