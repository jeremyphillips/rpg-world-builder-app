import type { AdminUserCampaignCounts, AdminUserDeleteBlockReason } from '@rpg/contracts'

export type AdminUserDeleteSubject = {
  id: string
  displayName: string
  email: string
  canDelete: boolean
  deleteBlockedReasons: AdminUserDeleteBlockReason[]
  campaignCounts: AdminUserCampaignCounts
}

export function toAdminUserDeleteSubject(user: {
  id: string
  displayName: string
  email: string
  canDelete: boolean
  deleteBlockedReasons: AdminUserDeleteBlockReason[]
  campaignCounts: AdminUserCampaignCounts
}): AdminUserDeleteSubject {
  return user
}
