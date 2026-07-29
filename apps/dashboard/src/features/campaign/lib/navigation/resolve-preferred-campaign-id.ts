import { resolveLandingCampaignId } from '@rpg/contracts'

/** Just the campaign-selection preference fields read during resolution. */
interface CampaignPreference {
  lastSelectedCampaignId?: string | null
}

/** Minimal shape needed to validate a campaign id; satisfied by `Campaign`. */
interface CampaignIdentity {
  id: string
}

/**
 * Resolve the preferred campaign id from stored choice, server preference, or
 * sole-campaign fallback. Returns null when nothing valid resolves.
 */
export function resolvePreferredCampaignId(
  campaigns: readonly CampaignIdentity[],
  user: CampaignPreference | null | undefined,
  storedId: string | null,
): string | null {
  const candidates = [
    storedId,
    user?.lastSelectedCampaignId,
    campaigns.length === 1 ? campaigns[0]?.id : undefined,
  ]
  return resolveLandingCampaignId(campaigns, candidates)
}
