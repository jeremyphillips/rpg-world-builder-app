import type { ActionPlanResult, Location } from '@rpg/contracts'
import { countPlanTargetsByStatus, getDistinctUnchangedReasons } from '@rpg/contracts'

import {
  buildBulkChangeParentPlan,
  type BulkChangeParentRow,
} from './bulk-change-parent-action.lib'
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
  plan: ActionPlanResult
  unchangedReasons: ReturnType<typeof getDistinctUnchangedReasons>
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
      plan: { targets: [] },
      unchangedReasons: [],
    }
  }

  const plan = buildBulkChangeParentPlan(selected, config)
  const { wouldChange: wouldChangeCount, unchanged: unchangedCount } =
    countPlanTargetsByStatus(plan)
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
    plan,
    unchangedReasons: getDistinctUnchangedReasons(plan),
  }
}
