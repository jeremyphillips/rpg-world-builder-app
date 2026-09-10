import { CONTENT_VISIBILITY_MODE_ENTRIES, type ContentCampaignAccessPatch } from '@rpg/contracts'
import type { FieldGroupSummary } from '@rpg/ui/form'

import { resolveAvailabilityStatusSummary } from '@/lib/campaign-availability/availability-status-summary.lib'

function formatSpecificPlayersCount(count: number): string {
  return count === 1 ? '1 specific player' : `${count} specific players`
}

export function resolveCampaignAccessDetail(
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
  return resolveAvailabilityStatusSummary(access.available, resolveCampaignAccessDetail(access))
}
