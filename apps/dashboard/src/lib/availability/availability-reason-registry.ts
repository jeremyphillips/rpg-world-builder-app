import { INACTIVE_ROW_BADGE_LABEL } from '@/features/content/lib/master-detail/content-campaign-availability'

import type { CampaignSettingId } from './availability'
import { campaignSettingHref } from './campaign-settings-registry'

export const AVAILABILITY_REASON_CODES = [
  'subclasses-disabled',
  'multiclassing-disabled',
  'not-available-in-campaign',
] as const

export type AvailabilityReasonCode = (typeof AVAILABILITY_REASON_CODES)[number]

export const AVAILABILITY_SEVERITY_ORDER = ['info', 'warning', 'destructive'] as const

export type AvailabilitySeverity = (typeof AVAILABILITY_SEVERITY_ORDER)[number]

export type AvailabilityActionCtx = {
  campaignId: string
  contentType?: string
}

export type AvailabilityAction = {
  label: string
  href: string
}

export type AvailabilityReasonDefinition = {
  code: AvailabilityReasonCode
  title: string
  description: string
  severity: AvailabilitySeverity
  badgeLabel: string
  getAction?: (ctx: AvailabilityActionCtx) => AvailabilityAction | undefined
}

export const AVAILABILITY_REASON_REGISTRY: Record<
  AvailabilityReasonCode,
  AvailabilityReasonDefinition
> = {
  'subclasses-disabled': {
    code: 'subclasses-disabled',
    title: 'Subclass choices are disabled',
    description:
      'This feature is saved, but characters will not be prompted to choose a subclass until subclasses are enabled.',
    severity: 'warning',
    badgeLabel: INACTIVE_ROW_BADGE_LABEL,
    getAction: (ctx) => ({
      label: 'Enable subclasses',
      href: campaignSettingHref(ctx.campaignId, 'characterCreation.subclasses.enabled'),
    }),
  },
  'multiclassing-disabled': {
    code: 'multiclassing-disabled',
    title: 'Multiclassing is disabled',
    description:
      'Species multiclass policy and level limits are not editable until multiclassing is allowed in campaign rules.',
    severity: 'info',
    badgeLabel: INACTIVE_ROW_BADGE_LABEL,
    getAction: (ctx) => ({
      label: 'Edit multiclassing rules',
      href: campaignSettingHref(ctx.campaignId, 'characterCreation.multiclassing.enabled'),
    }),
  },
  'not-available-in-campaign': {
    code: 'not-available-in-campaign',
    title: 'Not active in this campaign',
    description: 'This content is hidden from players until it is marked active in this campaign.',
    severity: 'warning',
    badgeLabel: INACTIVE_ROW_BADGE_LABEL,
  },
}

export function getAvailabilityReasonDefinition(
  code: AvailabilityReasonCode,
): AvailabilityReasonDefinition {
  return AVAILABILITY_REASON_REGISTRY[code]
}

export function severityRank(severity: AvailabilitySeverity): number {
  return AVAILABILITY_SEVERITY_ORDER.indexOf(severity)
}

export function resolveReasonAction(
  reason: { code: AvailabilityReasonCode; settingId?: CampaignSettingId },
  ctx: AvailabilityActionCtx,
): AvailabilityAction | undefined {
  const definition = getAvailabilityReasonDefinition(reason.code)
  return definition.getAction?.(ctx)
}
