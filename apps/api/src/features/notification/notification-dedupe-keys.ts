export const CAMPAIGN_INVITE_DEDUPE_KEY_PHASES = ['received', 'accepted', 'completed'] as const

export type CampaignInviteDedupeKeyPhase = (typeof CAMPAIGN_INVITE_DEDUPE_KEY_PHASES)[number]

export function campaignInviteDedupeKey(
  inviteId: string,
  phase: CampaignInviteDedupeKeyPhase,
): string {
  return `campaign-invite:${inviteId}:${phase}`
}
