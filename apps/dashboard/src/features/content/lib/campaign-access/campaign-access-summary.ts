import { CONTENT_VISIBILITY_MODE_ENTRIES, type ContentCampaignAccessPatch } from '@rpg/contracts'

import { CAMPAIGN_ACCESS_UNAVAILABLE_HINT } from './campaign-access-labels'

export type CampaignAccessSummary = {
  primary: string
  secondary?: string
}

function formatSpecificPlayersCount(count: number): string {
  return count === 1 ? '1 specific player' : `${count} specific players`
}

/** Collapsed disclosure copy for the current campaign access draft. */
export function resolveCampaignAccessSummary(
  access: Pick<ContentCampaignAccessPatch, 'available' | 'visibilityMode' | 'participantIds'>,
): CampaignAccessSummary {
  if (!access.available) {
    return {
      primary: 'Unavailable',
      secondary: CAMPAIGN_ACCESS_UNAVAILABLE_HINT,
    }
  }

  if (access.visibilityMode === 'specific_players') {
    return {
      primary: `Available · ${formatSpecificPlayersCount(access.participantIds.length)}`,
    }
  }

  return {
    primary: `Available · ${CONTENT_VISIBILITY_MODE_ENTRIES[access.visibilityMode].label}`,
  }
}
