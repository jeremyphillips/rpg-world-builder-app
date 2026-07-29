/**
 * Dashboard-specific campaign path helpers. Id resolution lives in
 * `@rpg/contracts` (`resolveLandingCampaignId`, `resolveActiveCampaignSummary`).
 */

import type { CampaignListItem } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { isCampaignMembershipOnboardingIncomplete } from '../campaign-membership-onboarding'
import { resolvePreferredCampaignId } from './resolve-preferred-campaign-id'

export { resolveActiveCampaignSummary, resolveLandingCampaignId } from '@rpg/contracts'
export { resolvePreferredCampaignId } from './resolve-preferred-campaign-id'

/** Just the campaign-selection preference fields read during resolution. */
interface CampaignPreference {
  lastSelectedCampaignId?: string | null
}

/**
 * Resolve a campaign the Dashboard Continue card may promote. The candidate must
 * exist in the current campaigns query and have completed viewer onboarding.
 */
export function resolveContinueCampaign(
  campaigns: readonly CampaignListItem[],
  user: CampaignPreference | null | undefined,
  storedId: string | null,
): CampaignListItem | null {
  const id = resolvePreferredCampaignId(campaigns, user, storedId)
  if (!id) return null

  const campaign = campaigns.find((item) => item.id === id)
  if (!campaign || isCampaignMembershipOnboardingIncomplete(campaign)) {
    return null
  }

  return campaign
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
  isError: boolean
  activeName?: string
}

/** Label shown in the campaign switcher trigger for a given query state. */
export function getCampaignSwitcherLabel({ isError, activeName }: SwitcherLabelState): string {
  if (isError) return 'Couldn’t load campaigns'
  return activeName ?? 'Select campaign'
}
