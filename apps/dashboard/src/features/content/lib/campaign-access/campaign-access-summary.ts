import { CONTENT_VISIBILITY_MODE_ENTRIES, type ContentCampaignAccessPatch } from '@rpg/contracts'
import type { FieldGroupSummary } from '@rpg/ui/form'

import { CAMPAIGN_ACCESS_UNAVAILABLE_SUMMARY_SECONDARY } from './campaign-access-labels'

function formatSpecificPlayersCount(count: number): string {
  return count === 1 ? '1 specific player' : `${count} specific players`
}

function resolveCampaignAccessDetail(
  access: Pick<ContentCampaignAccessPatch, 'visibilityMode' | 'participantIds'>,
): string {
  if (access.visibilityMode === 'specific_players') {
    return formatSpecificPlayersCount(access.participantIds.length)
  }

  return CONTENT_VISIBILITY_MODE_ENTRIES[access.visibilityMode].label
}

/** Collapsed disclosure copy for the current campaign access draft. */
export function resolveCampaignAccessSummary(
  access: Pick<ContentCampaignAccessPatch, 'available' | 'visibilityMode' | 'participantIds'>,
): FieldGroupSummary {
  const detail = resolveCampaignAccessDetail(access)

  if (!access.available) {
    return {
      status: { label: 'Unavailable', tone: 'neutral', indicator: 'inactive' },
      detail,
      secondary: CAMPAIGN_ACCESS_UNAVAILABLE_SUMMARY_SECONDARY,
      surface: 'inactive',
    }
  }

  return {
    status: { label: 'Available', tone: 'positive', indicator: 'dot' },
    detail,
  }
}
