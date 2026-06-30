/**
 * Pure helpers for resolving which campaign is "active" or should drive a landing
 * redirect. Callers supply campaign lists and candidate ids (e.g. localStorage,
 * server preference); no React or I/O.
 */

/** Minimal shape needed to validate a campaign id; satisfied by `Campaign`. */
export interface CampaignIdRef {
  id: string
}

/** Campaign list entry with a display name; satisfied by `CampaignListItem`. */
export interface CampaignNameRef extends CampaignIdRef {
  identity: { name: string }
}

/**
 * Return the first candidate id that refers to a campaign the user can reach,
 * or null when none match. Candidates are tried in priority order.
 */
export function resolveLandingCampaignId(
  campaigns: readonly CampaignIdRef[],
  candidates: readonly (string | null | undefined)[],
): string | null {
  const validIds = new Set(campaigns.map((campaign) => campaign.id))
  for (const id of candidates) {
    if (id && validIds.has(id)) return id
  }
  return null
}

/**
 * Resolve the active campaign id and display name from ordered candidates, or
 * null when nothing valid matches.
 */
export function resolveActiveCampaignSummary(
  campaigns: readonly CampaignNameRef[],
  candidates: readonly (string | null | undefined)[],
): { id: string; name: string } | null {
  const id = resolveLandingCampaignId(campaigns, candidates)
  if (!id) return null
  const campaign = campaigns.find((entry) => entry.id === id)
  return campaign ? { id, name: campaign.identity.name } : null
}
