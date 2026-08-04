import {
  buildBulkCampaignAccessPlan,
  countPlanTargetsByStatus,
  getDistinctUnchangedReasons,
  type ActionPlanResult,
  type BulkCampaignAccessFormValues,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'

import {
  parseBulkAvailabilityOption,
  parseBulkVisibilityOption,
} from '../campaign-access-options.lib'
import type { BulkCampaignAccessFormFieldValues } from './build-bulk-campaign-access-fields'

export function toBulkCampaignAccessFormValues(
  fieldValues: BulkCampaignAccessFormFieldValues,
): BulkCampaignAccessFormValues {
  return {
    available: parseBulkAvailabilityOption(fieldValues.availableOption),
    visibilityMode: parseBulkVisibilityOption(fieldValues.visibilityModeOption),
  }
}

export type BulkCampaignAccessPreview = {
  selectedCount: number
  wouldChangeCount: number
  unchangedCount: number
  hasChanges: boolean
  plan: ActionPlanResult
  unchangedReasons: ReturnType<typeof getDistinctUnchangedReasons>
}

export function resolveBulkCampaignAccessPreview(
  selected: ReadonlyArray<{
    campaignAccess: ResolvedContentCampaignAccess
    id: string
    name: string
  }>,
  fieldValues: BulkCampaignAccessFormFieldValues,
): BulkCampaignAccessPreview {
  const bulk = toBulkCampaignAccessFormValues(fieldValues)
  const plan = buildBulkCampaignAccessPlan(
    selected.map((row) => ({
      targetId: row.id,
      targetName: row.name,
      campaignAccess: row.campaignAccess,
    })),
    bulk,
  )
  const { wouldChange: wouldChangeCount, unchanged: unchangedCount } =
    countPlanTargetsByStatus(plan)

  return {
    selectedCount: selected.length,
    wouldChangeCount,
    unchangedCount,
    hasChanges: bulk.available.kind !== 'unchanged' || bulk.visibilityMode.kind !== 'unchanged',
    plan,
    unchangedReasons: getDistinctUnchangedReasons(plan),
  }
}

export function createBulkCampaignAccessFieldDefaults(): BulkCampaignAccessFormFieldValues {
  return {
    availableOption: 'unchanged',
    visibilityModeOption: 'unchanged',
  }
}

export { BULK_CAMPAIGN_ACCESS_FORM_DEFAULT as BULK_CAMPAIGN_ACCESS_EMPTY_FORM_VALUES } from '@rpg/contracts'
