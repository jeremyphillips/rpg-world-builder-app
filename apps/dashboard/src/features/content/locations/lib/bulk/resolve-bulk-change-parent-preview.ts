import type { Location } from '@rpg/contracts'

import { isBulkChangeParentNoOp, type BulkChangeParentRow } from './bulk-change-parent-action.lib'
import {
  toBulkChangeParentConfig,
  type BulkChangeParentFormFieldValues,
} from './build-bulk-change-parent-fields'

export type BulkChangeParentPreview = {
  selectedCount: number
  wouldChangeCount: number
  unchangedCount: number
  isConfigured: boolean
  isClearing: boolean
  parentName?: string
}

export function resolveBulkChangeParentPreview(
  selected: readonly BulkChangeParentRow[],
  fieldValues: BulkChangeParentFormFieldValues,
  campaignLocations: readonly Location[],
): BulkChangeParentPreview {
  const config = toBulkChangeParentConfig(fieldValues)

  if (!config) {
    return {
      selectedCount: selected.length,
      wouldChangeCount: 0,
      unchangedCount: selected.length,
      isConfigured: false,
      isClearing: false,
    }
  }

  const wouldChangeCount = selected.filter((row) => !isBulkChangeParentNoOp(row, config)).length
  const unchangedCount = selected.length - wouldChangeCount
  const parentName =
    config.proposedParentId != null
      ? campaignLocations.find((location) => location.id === config.proposedParentId)?.name
      : undefined

  return {
    selectedCount: selected.length,
    wouldChangeCount,
    unchangedCount,
    isConfigured: true,
    isClearing: config.proposedParentId === null,
    parentName,
  }
}
