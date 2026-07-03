import type { MasterDetailListBadge } from '@/features/content/components/master-detail/master-detail-list-panel.client'
import { INACTIVE_ROW_BADGE_LABEL } from '@/features/content/lib/master-detail/content-campaign-availability'

import {
  AVAILABILITY_REASON_CODES,
  getAvailabilityReasonDefinition,
  severityRank,
  type AvailabilityReasonCode,
} from './availability-reason-registry'

export const CAMPAIGN_SETTING_IDS = [
  'characterCreation.subclasses.enabled',
  'characterCreation.multiclassing.enabled',
] as const

export type CampaignSettingId = (typeof CAMPAIGN_SETTING_IDS)[number]

export type AvailabilityReason = {
  code: AvailabilityReasonCode
  settingId?: CampaignSettingId
}

export type Availability = {
  status: 'active' | 'inactive'
  reasons?: AvailabilityReason[]
}

export const NOT_AVAILABLE_IN_CAMPAIGN_REASON: AvailabilityReason = {
  code: 'not-available-in-campaign',
}

/** Empty reasons resolve to active; any reason marks the row inactive. */
export function resolveAvailability(reasons: readonly AvailabilityReason[]): Availability {
  if (reasons.length === 0) return { status: 'active' }
  return { status: 'inactive', reasons: [...reasons] }
}

export function combineAvailabilityReasons(
  activeByCampaignToggle: boolean,
  extraReasons: readonly AvailabilityReason[] = [],
): Availability {
  const reasons: AvailabilityReason[] = [...extraReasons]
  if (!activeByCampaignToggle) {
    reasons.push(NOT_AVAILABLE_IN_CAMPAIGN_REASON)
  }
  return resolveAvailability(reasons)
}

function pickPrimaryReasonCode(reasons: readonly AvailabilityReason[]): AvailabilityReasonCode {
  let bestCode = reasons[0]!.code
  let bestSeverity = getAvailabilityReasonDefinition(bestCode).severity

  for (let index = 1; index < reasons.length; index += 1) {
    const reason = reasons[index]!
    const severity = getAvailabilityReasonDefinition(reason.code).severity
    const severityDelta = severityRank(severity) - severityRank(bestSeverity)

    if (severityDelta > 0) {
      bestCode = reason.code
      bestSeverity = severity
      continue
    }

    if (severityDelta === 0) {
      const reasonOrder = AVAILABILITY_REASON_CODES.indexOf(reason.code)
      const bestOrder = AVAILABILITY_REASON_CODES.indexOf(bestCode)
      if (reasonOrder < bestOrder) {
        bestCode = reason.code
        bestSeverity = severity
      }
    }
  }

  return bestCode
}

/** Highest severity wins; ties break on registry order. */
export function resolveAvailabilityBadge(
  availability: Availability,
): MasterDetailListBadge | undefined {
  if (availability.status === 'active') return undefined

  const reasons = availability.reasons ?? []
  if (reasons.length === 0) {
    return { variant: 'outline', label: INACTIVE_ROW_BADGE_LABEL }
  }

  const primaryCode = pickPrimaryReasonCode(reasons)
  return {
    variant: 'outline',
    label: getAvailabilityReasonDefinition(primaryCode).badgeLabel,
  }
}

export function resolveAvailabilityAlertVariant(
  availability: Availability,
): 'default' | 'info' | 'warning' | 'destructive' {
  if (availability.status === 'active') return 'default'

  const reasons = availability.reasons ?? []
  if (reasons.length === 0) return 'warning'

  const severity = getAvailabilityReasonDefinition(pickPrimaryReasonCode(reasons)).severity
  return severity
}
