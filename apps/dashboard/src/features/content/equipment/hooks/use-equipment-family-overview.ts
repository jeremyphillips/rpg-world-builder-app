import { useMemo } from 'react'

import { ROUTES } from '@/app/routes'
import { useCampaignRulesetLookup } from '@/lib/use-campaign-ruleset-lookup'

import { useContentOverviewMergedData } from '../../lib/list/create-content-list'
import { useEquipmentListResult, useEquipmentUsageMeta } from '../hooks/use-equipment'
import {
  equipmentFamilyOverviewAwaitingRulesetForFailures,
  equipmentFamilyOverviewHasOverlayFailures,
  filterEquipmentFamilyOverviewRows,
} from '../lib/equipment-family-overview-filter.lib'
import { useFamilyTableConfig } from '../hooks/use-family-table-config'
import {
  getEquipmentFamilyLabel,
  type EquipmentFamilyPath,
} from '../lib/shared/equipment-family-paths'

export function useEquipmentFamilyOverview(campaignId: string, family: EquipmentFamilyPath) {
  const {
    rulesetId: campaignRulesetId,
    isPending: rulesetPending,
    isError: rulesetError,
  } = useCampaignRulesetLookup(campaignId)
  const listResult = useEquipmentListResult(campaignId)
  const { data: equipment, isPending, isError } = useContentOverviewMergedData(listResult)
  const { data: usageMeta } = useEquipmentUsageMeta(campaignId)
  const {
    tableConfig,
    isPending: columnsPending,
    isError: columnsError,
  } = useFamilyTableConfig(campaignId, family, {
    usageSummaryLabels: usageMeta?.usageSummaryLabels,
    overviewUsageScope: usageMeta?.overviewUsageScope,
  })
  const heading = getEquipmentFamilyLabel(family)

  const rulesetGate = useMemo(
    () => ({
      rulesetId: campaignRulesetId,
      isPending: rulesetPending,
      isError: rulesetError,
    }),
    [campaignRulesetId, rulesetPending, rulesetError],
  )

  const filtered = useMemo(
    () => filterEquipmentFamilyOverviewRows(equipment, family, rulesetGate),
    [equipment, family, rulesetGate],
  )

  const awaitingRulesetForFailures = equipmentFamilyOverviewAwaitingRulesetForFailures(
    equipment,
    rulesetGate,
  )

  const listOrColumnsFailed = isError || columnsError
  const rulesetLookupFailed =
    rulesetError &&
    !rulesetPending &&
    !listOrColumnsFailed &&
    equipmentFamilyOverviewHasOverlayFailures(equipment)

  return {
    heading,
    filtered,
    tableConfig,
    isPending: isPending || columnsPending || rulesetPending || awaitingRulesetForFailures,
    isError: listOrColumnsFailed,
    rulesetLookupFailed,
    newHref: ROUTES.content.equipment.create(campaignId, family),
    newLabel: `New ${heading.replace(/s$/, '')}`,
  }
}
