import type { AdminUserDetail, PlatformRole } from '@rpg/contracts'

import { findUserWithActivityTimestampsById } from '../user/user.service'
import { buildAdminUserDetail } from './admin-user-summary.service'

export async function getAdminUserDetail(
  userId: string,
  actor: { id: string; role: PlatformRole },
): Promise<AdminUserDetail | null> {
  const user = await findUserWithActivityTimestampsById(userId)
  if (!user) return null

  return buildAdminUserDetail(user, actor)
}
