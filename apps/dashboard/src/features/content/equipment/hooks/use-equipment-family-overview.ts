import { ROUTES } from '@/app/routes'
import { useCampaignRulesetLookup } from '@/lib/use-campaign-ruleset-lookup'

import { useContentOverviewMergedData } from '../../lib/list/create-content-list'
import { isContentOverlayFailureOverviewRow } from '../../lib/list/content-overlay-overview.lib'
import { type SystemRulesetId } from '@rpg/contracts'
import { resolveCatalogSeedBody } from '../../lib/forms/registry/resolve-catalog-seed-body.lib'
import { useEquipmentListResult, useEquipmentUsageMeta } from '../hooks/use-equipment'
import { useFamilyTableConfig } from '../hooks/use-family-table-config'
import {
  familyPathToEquipmentKind,
  getEquipmentFamilyLabel,
  type EquipmentFamilyPath,
} from '../lib/shared/equipment-family-paths'

export function useEquipmentFamilyOverview(campaignId: string, family: EquipmentFamilyPath) {
  const kind = familyPathToEquipmentKind(family)
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
  const canFamilyFilterOverlayFailures = Boolean(campaignRulesetId) && !rulesetPending
  const filtered = kind
    ? equipment.filter((item) => {
        if (isContentOverlayFailureOverviewRow(item)) {
          if (!canFamilyFilterOverlayFailures) return false
          const seed = resolveCatalogSeedBody(
            'equipment',
            campaignRulesetId as SystemRulesetId,
            item.id,
          )
          return seed?.kind === kind
        }
        return item.kind === kind
      })
    : equipment

  return {
    heading,
    filtered,
    tableConfig,
    isPending: isPending || columnsPending || rulesetPending,
    isError: isError || columnsError || rulesetError,
    newHref: ROUTES.content.equipment.create(campaignId, family),
    newLabel: `New ${heading.replace(/s$/, '')}`,
  }
}
