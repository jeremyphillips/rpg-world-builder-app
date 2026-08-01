/**
 * Cross-app paths served behind the single-origin proxy. Apps must import these
 * instead of hardcoding `/app/` or `/login` so trailing-slash and basename
 * assumptions stay aligned.
 */
export const CROSS_APP_PATHS = {
  dashboard: '/app/',
  login: '/login',
  signup: '/signup',
  dashboardProfile: '/app/profile',
  dashboardAccount: '/app/account',
} as const

export type CrossAppPath = (typeof CROSS_APP_PATHS)[keyof typeof CROSS_APP_PATHS]

/** Dashboard SPA campaign overview — full origin path (Vite base `/app/` + `/campaigns/:id`). */
export function crossAppCampaignDetailPath(campaignId: string): string {
  return `/app/campaigns/${campaignId}`
}

/** Dashboard SPA campaign onboarding — membership-scoped; no invite id in the URL. */
export function crossAppCampaignOnboardingPath(campaignId: string): string {
  return `/app/campaigns/${campaignId}/onboarding`
}

/** Dashboard SPA campaign-scoped PC detail. */
export function crossAppCampaignCharacterDetailPath(
  campaignId: string,
  characterId: string,
): string {
  return `/app/campaigns/${campaignId}/characters/${characterId}`
}

/** Public app invite review — invite id in the URL segment (authenticated resolve). */
export function crossAppCampaignInviteReviewPath(inviteId: string): string {
  return `/campaign-invites/${inviteId}`
}

/** Dashboard SPA direct message thread. */
export function crossAppConversationPath(conversationId: string): string {
  return `/app/messages/${conversationId}`
}
