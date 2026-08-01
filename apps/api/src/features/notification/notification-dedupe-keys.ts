export const CAMPAIGN_INVITE_DEDUPE_KEY_PHASES = ['received', 'accepted', 'completed'] as const

export type CampaignInviteDedupeKeyPhase = (typeof CAMPAIGN_INVITE_DEDUPE_KEY_PHASES)[number]

export function campaignInviteDedupeKey(
  inviteId: string,
  phase: CampaignInviteDedupeKeyPhase,
): string {
  return `campaign-invite:${inviteId}:${phase}`
}

/** Shared invitee lifecycle slot — received and cancelled supersede on the same key. */
export function campaignInviteInviteeLifecycleDedupeKey(inviteId: string): string {
  return `campaign-invite:${inviteId}:invitee`
}

export function campaignMemberRemovedDedupeKey(membershipId: string): string {
  return `campaign-member-removed:${membershipId}`
}

export function directMessageDedupeKey(conversationId: string): string {
  return `message-direct:${conversationId}`
}
