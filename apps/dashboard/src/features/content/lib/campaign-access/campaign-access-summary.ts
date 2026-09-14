import {
  CONTENT_VISIBILITY_MODE_ENTRIES,
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type ContentCampaignAccessPatch,
} from '@rpg/contracts'
import type { FieldGroupSummary } from '@rpg/ui/form'

import { resolveAvailabilityStatusSummary } from '@/lib/campaign-availability/availability-status-summary.lib'

function formatSpecificPlayersCount(count: number): string {
  return count === 1 ? '1 specific player' : `${count} specific players`
}

export function resolveCampaignAccessDetail(
  access: Pick<ContentCampaignAccessPatch, 'visibilityMode' | 'participantIds'>,
): string {
  const visibilityMode = access.visibilityMode ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS.visibilityMode

  if (visibilityMode === 'specific_players') {
    return formatSpecificPlayersCount(access.participantIds?.length ?? 0)
  }

  return (
    CONTENT_VISIBILITY_MODE_ENTRIES[visibilityMode]?.label ??
    CONTENT_VISIBILITY_MODE_ENTRIES[DEFAULT_CONTENT_CAMPAIGN_ACCESS.visibilityMode].label
  )
}

/** Collapsed disclosure copy for the current campaign access draft. */
export function resolveCampaignAccessSummary(
  access: Pick<ContentCampaignAccessPatch, 'available' | 'visibilityMode' | 'participantIds'>,
): FieldGroupSummary {
  return resolveAvailabilityStatusSummary(access.available, resolveCampaignAccessDetail(access))
}
