import type {
  AdminUserCampaignCounts,
  AdminUserDeleteBlockReason,
  AdminUserDeletionPreview,
  AdminUserDetail,
  AdminUserListItem,
  PlatformRole,
} from '@rpg/contracts'

import { CampaignMembershipModel } from '../campaign'
import { CampaignInviteModel } from '../campaign-invite'
import { CharacterModel } from '../character'
import { countSuperadminsExcluding, type UserWithActivityTimestamps } from '../user'

const EMPTY_CAMPAIGN_COUNTS: AdminUserCampaignCounts = {
  owned: 0,
  coOwned: 0,
  joined: 0,
}

function bucketCampaignRole(role: string): keyof AdminUserCampaignCounts | null {
  if (role === 'owner') return 'owned'
  if (role === 'co-owner') return 'coOwned'
  if (role === 'pc' || role === 'observer') return 'joined'
  return null
}

export async function getCampaignCountsForUsers(
  userIds: readonly string[],
): Promise<Map<string, AdminUserCampaignCounts>> {
  const counts = new Map<string, AdminUserCampaignCounts>()
  for (const userId of userIds) {
    counts.set(userId, { ...EMPTY_CAMPAIGN_COUNTS })
  }
  if (userIds.length === 0) return counts

  const rows = await CampaignMembershipModel.aggregate<{
    _id: { userId: string; campaignRole: string }
    count: number
  }>([
    { $match: { userId: { $in: [...userIds] } } },
    {
      $group: {
        _id: { userId: '$userId', campaignRole: '$campaignRole' },
        count: { $sum: 1 },
      },
    },
  ])

  for (const row of rows) {
    const userId = row._id.userId
    const bucket = bucketCampaignRole(row._id.campaignRole)
    if (!bucket) continue

    const current = counts.get(userId) ?? { ...EMPTY_CAMPAIGN_COUNTS }
    current[bucket] += row.count
    counts.set(userId, current)
  }

  return counts
}

export async function getCharacterCountsForUsers(
  userIds: readonly string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  for (const userId of userIds) {
    counts.set(userId, 0)
  }
  if (userIds.length === 0) return counts

  const rows = await CharacterModel.aggregate<{ _id: string; count: number }>([
    {
      $match: {
        userId: { $in: [...userIds] },
        characterType: 'pc',
      },
    },
    { $group: { _id: '$userId', count: { $sum: 1 } } },
  ])

  for (const row of rows) {
    counts.set(row._id, row.count)
  }

  return counts
}

export async function getInviteDependencyCounts(
  normalizedEmail: string,
  userId: string,
): Promise<{ pendingInvites: number; acceptedInvites: number }> {
  const [pendingInvites, acceptedInvites] = await Promise.all([
    CampaignInviteModel.countDocuments({
      normalizedEmail,
      status: 'pending',
    }),
    CampaignInviteModel.countDocuments({
      acceptedByUserId: userId,
      status: 'accepted',
    }),
  ])

  return { pendingInvites, acceptedInvites }
}

export async function getControlledCharacterCount(userId: string): Promise<number> {
  const memberships = await CampaignMembershipModel.find({ userId })
    .select('controlledCharacterIds')
    .lean<{ controlledCharacterIds?: string[] }[]>()

  return memberships.reduce(
    (total, membership) => total + (membership.controlledCharacterIds?.length ?? 0),
    0,
  )
}

export async function userOwnsCampaigns(userId: string): Promise<boolean> {
  const owned = await CampaignMembershipModel.countDocuments({
    userId,
    campaignRole: 'owner',
  })
  return owned > 0
}

export async function computeDeleteBlockers({
  actorId,
  actorRole,
  targetUserId,
  targetRole,
}: {
  actorId: string
  actorRole: PlatformRole
  targetUserId: string
  targetRole: PlatformRole
}): Promise<AdminUserDeleteBlockReason[]> {
  const blockers: AdminUserDeleteBlockReason[] = []

  if (actorRole !== 'superadmin') {
    blockers.push('insufficient_role')
  }

  if (actorId === targetUserId) {
    blockers.push('self')
  }

  if (targetRole === 'superadmin') {
    const otherSuperadmins = await countSuperadminsExcluding(targetUserId)
    if (otherSuperadmins === 0) {
      blockers.push('last_superadmin')
    }
  }

  if (await userOwnsCampaigns(targetUserId)) {
    blockers.push('owns_campaigns')
  }

  return blockers
}

export function canDeleteUser(blockers: readonly AdminUserDeleteBlockReason[]): boolean {
  return blockers.length === 0
}

export async function buildAdminUserListItem(
  user: UserWithActivityTimestamps,
  actor: { id: string; role: PlatformRole },
  campaignCounts: AdminUserCampaignCounts,
  characterCount: number,
): Promise<AdminUserListItem> {
  const deleteBlockedReasons = await computeDeleteBlockers({
    actorId: actor.id,
    actorRole: actor.role,
    targetUserId: user.id,
    targetRole: user.role,
  })

  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastSignedInAt: user.lastSignedInAt,
    lastActiveAt: user.lastActiveAt,
    campaignCounts,
    characterCount,
    canDelete: canDeleteUser(deleteBlockedReasons),
    deleteBlockedReasons,
  }
}

export async function buildAdminUserDetail(
  user: UserWithActivityTimestamps,
  actor: { id: string; role: PlatformRole },
): Promise<AdminUserDetail> {
  const [campaignCountsMap, characterCountsMap, inviteCounts, controlledCharacterCount] =
    await Promise.all([
      getCampaignCountsForUsers([user.id]),
      getCharacterCountsForUsers([user.id]),
      getInviteDependencyCounts(user.email.toLowerCase(), user.id),
      getControlledCharacterCount(user.id),
    ])

  const deleteBlockedReasons = await computeDeleteBlockers({
    actorId: actor.id,
    actorRole: actor.role,
    targetUserId: user.id,
    targetRole: user.role,
  })

  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    platformRole: user.role,
    createdAt: user.createdAt,
    lastSignedInAt: user.lastSignedInAt,
    lastActiveAt: user.lastActiveAt,
    campaignCounts: campaignCountsMap.get(user.id) ?? { ...EMPTY_CAMPAIGN_COUNTS },
    characterCount: characterCountsMap.get(user.id) ?? 0,
    controlledCharacterCount,
    pendingInviteCount: inviteCounts.pendingInvites,
    acceptedIncompleteInviteCount: inviteCounts.acceptedInvites,
    canDelete: canDeleteUser(deleteBlockedReasons),
    deleteBlockedReasons,
  }
}

export async function buildAdminUserDeletionPreview(
  user: UserWithActivityTimestamps,
  actor: { id: string; role: PlatformRole },
): Promise<AdminUserDeletionPreview> {
  const [campaignCountsMap, characterCountsMap, inviteCounts, controlledCharacters] =
    await Promise.all([
      getCampaignCountsForUsers([user.id]),
      getCharacterCountsForUsers([user.id]),
      getInviteDependencyCounts(user.email.toLowerCase(), user.id),
      getControlledCharacterCount(user.id),
    ])

  const blockers = await computeDeleteBlockers({
    actorId: actor.id,
    actorRole: actor.role,
    targetUserId: user.id,
    targetRole: user.role,
  })

  return {
    user: {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
    },
    blockers,
    dependencies: {
      characters: characterCountsMap.get(user.id) ?? 0,
      memberships: campaignCountsMap.get(user.id) ?? { ...EMPTY_CAMPAIGN_COUNTS },
      pendingInvites: inviteCounts.pendingInvites,
      acceptedInvites: inviteCounts.acceptedInvites,
      controlledCharacters,
    },
  }
}
