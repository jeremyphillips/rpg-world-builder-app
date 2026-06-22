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
