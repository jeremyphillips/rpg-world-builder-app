import {
  AVAILABILITY_STATUS_AVAILABLE,
  AVAILABILITY_STATUS_UNAVAILABLE,
} from '@/lib/campaign-availability/availability-status-summary.lib'

export type BroadAvailabilityPresentation = {
  statusLabel: 'Available' | 'Unavailable'
  indicator: 'dot' | 'inactive'
  tone: 'success' | 'warning'
}

/** Broad Available / Unavailable copy for nested master-detail headers — excludes player-access detail. */
export function resolveBroadAvailabilityPresentation(
  isAvailable: boolean,
): BroadAvailabilityPresentation {
  if (!isAvailable) {
    return {
      statusLabel: 'Unavailable' as const,
      indicator: AVAILABILITY_STATUS_UNAVAILABLE.indicator,
      tone: AVAILABILITY_STATUS_UNAVAILABLE.tone,
    }
  }

  return {
    statusLabel: 'Available' as const,
    indicator: AVAILABILITY_STATUS_AVAILABLE.indicator,
    tone: AVAILABILITY_STATUS_AVAILABLE.tone,
  }
}
