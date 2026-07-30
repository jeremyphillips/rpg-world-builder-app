/**
 * Dashboard-specific campaign path helpers. Id resolution lives in
 * `@rpg/contracts` (`resolveLandingCampaignId`, `resolveActiveCampaignSummary`).
 */

import type { CampaignListItem } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { CAMPAIGNS_QUERY_ERROR_MESSAGE, CAMPAIGN_UNKNOWN_NAME } from '../campaign-display'
import { isCampaignMembershipOnboardingIncomplete } from '../campaign-membership-onboarding'
import type { CampaignsQueryState } from '../resolve-campaign-topbar-title-state'
import { resolveCampaignTopbarTitleState } from '../resolve-campaign-topbar-title-state'
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
 * Resolve a campaign the Dashboard should prompt to finish onboarding.
 * The candidate must exist and have incomplete viewer onboarding.
 */
export function resolveResumeSetupCampaign(
  campaigns: readonly CampaignListItem[],
  user: CampaignPreference | null | undefined,
  storedId: string | null,
): CampaignListItem | null {
  const id = resolvePreferredCampaignId(campaigns, user, storedId)
  if (!id) return null

  const campaign = campaigns.find((item) => item.id === id)
  if (!campaign || !isCampaignMembershipOnboardingIncomplete(campaign)) {
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
 */
export function resolveTargetPathOnSwitch(pathname: string, fromId: string, toId: string): string {
  const prefix = `/campaigns/${fromId}`
  if (!pathname.startsWith(prefix)) return ROUTES.campaign.detail(toId)
  const segments = pathname.slice(prefix.length).split('/').filter(Boolean)
  const section = segments[0] ? `/${segments[0]}` : ''
  return `/campaigns/${toId}${section}`
}

export const CAMPAIGN_SWITCHER_NO_SELECTION_LABEL = 'Select campaign' as const

export type CampaignSwitcherTriggerState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'noSelection' }
  | { kind: 'missing' }
  | { kind: 'resolved'; campaign: CampaignListItem }

/** Classifies switcher trigger state from the active id and campaigns query. */
export function resolveCampaignSwitcherTriggerState(
  activeCampaignId: string | null | undefined,
  query: CampaignsQueryState,
): CampaignSwitcherTriggerState {
  if (query.isError) {
    return { kind: 'error' }
  }

  if (query.isPending || query.data === undefined) {
    return { kind: 'loading' }
  }

  if (!activeCampaignId) {
    return { kind: 'noSelection' }
  }

  const lookup = resolveCampaignTopbarTitleState(activeCampaignId, query)
  if (lookup.kind === 'missing') {
    return { kind: 'missing' }
  }

  if (lookup.kind === 'resolved') {
    const campaign = query.data.find((item) => item.id === activeCampaignId)
    if (!campaign) {
      return { kind: 'missing' }
    }
    return { kind: 'resolved', campaign }
  }

  return { kind: 'loading' }
}

/** Accessible label for the switcher trigger given its resolved state. */
export function getCampaignSwitcherTriggerLabel(state: CampaignSwitcherTriggerState): string {
  switch (state.kind) {
    case 'error':
      return CAMPAIGNS_QUERY_ERROR_MESSAGE
    case 'noSelection':
      return CAMPAIGN_SWITCHER_NO_SELECTION_LABEL
    case 'missing':
      return CAMPAIGN_UNKNOWN_NAME
    default:
      return CAMPAIGN_SWITCHER_NO_SELECTION_LABEL
  }
}
