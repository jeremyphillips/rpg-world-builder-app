import {
  BULK_CAMPAIGN_ACCESS_FORM_DEFAULT,
  countBulkCampaignAccessChanges,
  hasBulkCampaignAccessChanges,
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
}

export function resolveBulkCampaignAccessPreview(
  selected: ReadonlyArray<{ campaignAccess: ResolvedContentCampaignAccess }>,
  fieldValues: BulkCampaignAccessFormFieldValues,
): BulkCampaignAccessPreview {
  const bulk = toBulkCampaignAccessFormValues(fieldValues)
  const { wouldChangeCount, unchangedCount } = countBulkCampaignAccessChanges(selected, bulk)

  return {
    selectedCount: selected.length,
    wouldChangeCount,
    unchangedCount,
    hasChanges: hasBulkCampaignAccessChanges(bulk),
  }
}

export function createBulkCampaignAccessFieldDefaults(): BulkCampaignAccessFormFieldValues {
  return {
    availableOption: 'unchanged',
    visibilityModeOption: 'unchanged',
  }
}

export const BULK_CAMPAIGN_ACCESS_EMPTY_FORM_VALUES = BULK_CAMPAIGN_ACCESS_FORM_DEFAULT
