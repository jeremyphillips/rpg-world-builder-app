/**
 * Lightweight persistence for the most recently selected campaign. The URL is
 * the source of truth for the *active* campaign; this only remembers the last
 * pick so a returning user can be redirected from `/`. Wrapped in try/catch
 * because `localStorage` can throw (private mode, disabled storage).
 */
const STORAGE_KEY = 'rpg.selectedCampaignId'

export function readStoredCampaignId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function writeStoredCampaignId(campaignId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, campaignId)
  } catch {
    // Ignore storage failures; persistence is best-effort.
  }
}
