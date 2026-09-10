import type { FieldGroupSummary, FormItem, FormDensity } from '@rpg/ui/form'

import { resolveVocabularyAvailabilitySummary } from './availability-status-summary.lib'

export { resolveVocabularyAvailabilitySummary }

import {
  CAMPAIGN_ACCESS_AVAILABLE_HINT,
  CAMPAIGN_ACCESS_AVAILABLE_LABEL,
  CAMPAIGN_ACCESS_AVAILABLE_TOOLTIP,
  CAMPAIGN_ACCESS_CHANGE_LABEL,
  CAMPAIGN_ACCESS_DONE_LABEL,
  CAMPAIGN_ACCESS_SECTION_HINT,
  CAMPAIGN_ACCESS_SECTION_LEGEND,
} from '@/features/content/lib/campaign-access/campaign-access-labels'

export type CampaignAvailabilityPresentation = 'dialog' | 'disclosure'

export type CampaignAvailabilityFieldCtx = {
  groupId: string
  pending: boolean
  summaryDependsOn: string[]
  resolveSummary: (values: Record<string, unknown>) => FieldGroupSummary
  groupDensity?: FormDensity
  /** Override for content immediate-preflight switch slot. */
  availabilityField?: FormItem
  /** Where the editor renders. Defaults to in-place disclosure. */
  presentation?: CampaignAvailabilityPresentation
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
  const presentation = ctx.presentation ?? 'disclosure'
  const disclosure =
    presentation === 'dialog'
      ? {
          variant: 'dialog' as const,
          openLabel: CAMPAIGN_ACCESS_CHANGE_LABEL,
          closeLabel: CAMPAIGN_ACCESS_DONE_LABEL,
          disabled: ctx.pending,
          hint: CAMPAIGN_ACCESS_SECTION_HINT,
          dialogHeadline: CAMPAIGN_ACCESS_SECTION_LEGEND,
          summaryDependsOn: ctx.summaryDependsOn,
          resolveSummary: ctx.resolveSummary,
        }
      : {
          variant: 'inline' as const,
          defaultOpen: false,
          panelDivider: false,
          openLabel: CAMPAIGN_ACCESS_CHANGE_LABEL,
          closeLabel: CAMPAIGN_ACCESS_DONE_LABEL,
          disabled: ctx.pending,
          summaryDependsOn: ctx.summaryDependsOn,
          resolveSummary: ctx.resolveSummary,
        }

  return [
    {
      kind: 'group',
      id: ctx.groupId,
      legend: CAMPAIGN_ACCESS_SECTION_LEGEND,
      density: ctx.groupDensity ?? 'compact',
      disclosure,
      fields: [ctx.availabilityField ?? defaultAvailabilitySwitchField(ctx.pending)],
    },
  ]
}
