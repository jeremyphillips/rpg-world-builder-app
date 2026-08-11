import type { FormItem, FieldGroupSummary, FormDensity } from '@rpg/ui/form'

import {
  CAMPAIGN_ACCESS_AVAILABLE_HINT,
  CAMPAIGN_ACCESS_AVAILABLE_LABEL,
  CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP,
  CAMPAIGN_ACCESS_CHANGE_LABEL,
  CAMPAIGN_ACCESS_DONE_LABEL,
  CAMPAIGN_ACCESS_SECTION_LEGEND,
  CAMPAIGN_ACCESS_UNSAVED_SUFFIX,
} from '@/features/content/lib/campaign-access/campaign-access-labels'

export type CampaignAvailabilityFieldCtx = {
  groupId: string
  pending: boolean
  summaryDependsOn: string[]
  resolveSummary: (values: Record<string, unknown>) => FieldGroupSummary
  groupDensity?: FormDensity
  /** Override for content immediate-preflight switch slot. */
  availabilityField?: FormItem
}

export function resolveVocabularyAvailabilitySummary(available: boolean): FieldGroupSummary {
  if (!available) {
    return {
      status: { label: 'Unavailable', tone: 'warning', indicator: 'inactive' },
    }
  }

  return {
    status: { label: 'Available', tone: 'success', indicator: 'dot' },
  }
}

function defaultAvailabilitySwitchField(pending: boolean): FormItem {
  return {
    type: 'switch',
    name: 'available',
    label: CAMPAIGN_ACCESS_AVAILABLE_LABEL,
    hint: CAMPAIGN_ACCESS_AVAILABLE_HINT,
    info: CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP,
    labelPosition: 'settings',
    width: 'full',
    disabled: pending,
  }
}

/** Availability-only disclosure group — shared by content and vocabulary consumers. */
export function buildCampaignAvailabilityFields(ctx: CampaignAvailabilityFieldCtx): FormItem[] {
  return [
    {
      kind: 'group',
      id: ctx.groupId,
      legend: CAMPAIGN_ACCESS_SECTION_LEGEND,
      legendSize: 'array',
      chrome: { variant: 'inset' },
      density: ctx.groupDensity ?? 'compact',
      disclosure: {
        variant: 'summary',
        defaultOpen: false,
        panelDivider: false,
        openLabel: CAMPAIGN_ACCESS_CHANGE_LABEL,
        closeLabel: CAMPAIGN_ACCESS_DONE_LABEL,
        unsavedSuffix: CAMPAIGN_ACCESS_UNSAVED_SUFFIX,
        showDirtySuffix: true,
        disabled: ctx.pending,
        summaryDependsOn: ctx.summaryDependsOn,
        resolveSummary: ctx.resolveSummary,
      },
      fields: [ctx.availabilityField ?? defaultAvailabilitySwitchField(ctx.pending)],
    },
  ]
}
