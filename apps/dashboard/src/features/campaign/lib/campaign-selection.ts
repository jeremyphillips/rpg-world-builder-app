/**
 * Pure helpers for resolving which campaign is "active"/"landing". Kept free of
 * React and I/O so they are cheap to unit test (callers supply the candidates,
 * e.g. localStorage and the session preference).
 */

import { ROUTES } from '@/app/routes'

/** Minimal shape needed to validate a campaign id; satisfied by `Campaign`. */
interface CampaignIdentity {
  id: string
}

/**
 * Return the first candidate id that refers to a campaign the user can reach,
 * or null when none match. Candidates are tried in priority order.
 */
export function resolveLandingCampaignId(
  campaigns: readonly CampaignIdentity[],
  candidates: readonly (string | null | undefined)[],
): string | null {
  const validIds = new Set(campaigns.map((campaign) => campaign.id))
  for (const id of candidates) {
    if (id && validIds.has(id)) return id
  }
  return null
}

/** Just the campaign-selection preference fields read during resolution. */
interface CampaignPreference {
  lastSelectedCampaignId?: string | null
}

/**
 * Resolve the path a returning user should land on: their stored choice, then
 * their server preference, then the sole campaign if they have exactly one.
 * Returns null when nothing valid resolves (the caller shows the picker).
 */
export function resolveLandingPath(
  campaigns: readonly CampaignIdentity[],
  user: CampaignPreference | null | undefined,
  storedId: string | null,
): string | null {
  const candidates = [
    storedId,
    user?.lastSelectedCampaignId,
    campaigns.length === 1 ? campaigns[0]?.id : undefined,
  ]
  const id = resolveLandingCampaignId(campaigns, candidates)
  return id ? ROUTES.campaign.detail(id) : null
}

/**
 * Resolve the target campaign path when switching campaigns. Preserves the
 * current section (e.g. /sessions, /settings) but strips any entity-specific
 * IDs deeper than one segment — they belong to the old campaign and cannot
 * transfer. Falls back to the campaign detail route if the pathname doesn't
 * match the expected campaign prefix.
 *
 * Examples:
 *   /campaigns/abc           → /campaigns/xyz
 *   /campaigns/abc/sessions  → /campaigns/xyz/sessions
 *   /campaigns/abc/sessions/123 → /campaigns/xyz/sessions
 */
export function resolveTargetPathOnSwitch(pathname: string, fromId: string, toId: string): string {
  const prefix = `/campaigns/${fromId}`
  if (!pathname.startsWith(prefix)) return ROUTES.campaign.detail(toId)
  const segments = pathname.slice(prefix.length).split('/').filter(Boolean)
  const section = segments[0] ? `/${segments[0]}` : ''
  return `/campaigns/${toId}${section}`
}

interface SwitcherLabelState {
  isPending: boolean
  isError: boolean
  activeName?: string
}

/** Label shown in the campaign switcher trigger for a given query state. */
export function getCampaignSwitcherLabel({
  isPending,
  isError,
  activeName,
}: SwitcherLabelState): string {
  if (isPending) return 'Loading campaigns…'
  if (isError) return 'Couldn’t load campaigns'
  return activeName ?? 'Select campaign'
}
