import type { SessionUser } from '@rpg/contracts'
import { writeStoredCampaignId } from '@rpg/contracts'

import { putJson } from './request'

/** Writes the preferred campaign id to localStorage (same-origin, best-effort). */
export function persistCampaignSelectionLocal(campaignId: string): void {
  writeStoredCampaignId(campaignId)
}

/** Persists the preferred campaign on the server and returns the updated session user. */
export async function persistCampaignSelectionRemote(campaignId: string): Promise<SessionUser> {
  const { user } = await putJson<{ user: SessionUser }>(
    '/api/campaigns/selection',
    { campaignId },
    'Could not update selected campaign.',
  )
  return user
}

/**
 * Persists campaign selection locally and attempts server preference sync.
 * Recovery UI must not depend on server success — local storage is enough for ranking.
 */
export async function persistCampaignSelectionBestEffort(campaignId: string): Promise<void> {
  persistCampaignSelectionLocal(campaignId)
  try {
    await persistCampaignSelectionRemote(campaignId)
  } catch {
    // Server preference is enhancement; recovery cards work from local storage alone.
  }
}
