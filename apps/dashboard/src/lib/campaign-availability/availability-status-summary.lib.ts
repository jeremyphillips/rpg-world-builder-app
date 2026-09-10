import type { FieldGroupSummary } from '@rpg/ui/form'

export const AVAILABILITY_STATUS_AVAILABLE = {
  label: 'Available',
  tone: 'success' as const,
  indicator: 'dot' as const,
}

export const AVAILABILITY_STATUS_UNAVAILABLE = {
  label: 'Unavailable',
  tone: 'warning' as const,
  indicator: 'inactive' as const,
}

/** Shared Available / Unavailable status chip for campaign and vocabulary availability. */
export function resolveAvailabilityStatusSummary(
  available: boolean,
  detail?: string,
): FieldGroupSummary {
  if (!available) {
    return {
      status: AVAILABILITY_STATUS_UNAVAILABLE,
      ...(detail ? { detail } : {}),
      chrome: { variant: 'accent', tone: 'warning', emphasis: 'faint' },
    }
  }

  return {
    status: AVAILABILITY_STATUS_AVAILABLE,
    ...(detail ? { detail } : {}),
  }
}

export function resolveVocabularyAvailabilitySummary(available: boolean): FieldGroupSummary {
  return resolveAvailabilityStatusSummary(available)
}
