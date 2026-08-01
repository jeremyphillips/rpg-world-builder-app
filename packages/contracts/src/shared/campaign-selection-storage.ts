/**
 * Cross-app localStorage for the user's most recently selected campaign. The
 * URL is the source of truth for the active campaign; this only remembers the
 * last pick for landing redirects. Wrapped in try/catch because localStorage
 * can throw (private mode, disabled storage).
 */
export const CAMPAIGN_SELECTION_STORAGE_KEY = 'rpg.selectedCampaignId' as const

export function readStoredCampaignId(): string | null {
  try {
    return localStorage.getItem(CAMPAIGN_SELECTION_STORAGE_KEY)
  } catch {
    return null
  }
}

export function writeStoredCampaignId(campaignId: string): void {
  try {
    localStorage.setItem(CAMPAIGN_SELECTION_STORAGE_KEY, campaignId)
  } catch {
    // Ignore storage failures; persistence is best-effort.
  }
}
