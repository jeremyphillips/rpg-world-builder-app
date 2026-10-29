import { useEffect, useState } from 'react'
import type { ContentOverviewUsageScope, ContentUsageSummaryLabels } from '@rpg/contracts'

import { useRulesetPatch } from '@/features/homebrew'

import {
  loadFamilyTableConfig,
  type FamilyTableConfig,
} from '../lib/shared/equipment-family-overview-columns'
import type { EquipmentFamilyPath } from '../lib/shared/equipment-family-paths'

type ContentUsageOpts = {
  usageSummaryLabels?: ContentUsageSummaryLabels
  overviewUsageScope?: ContentOverviewUsageScope
}

type FamilyTableLoadState = {
  campaignId: string
  family: EquipmentFamilyPath
  usageKey: string
  tableConfig: FamilyTableConfig | null
  isError: boolean
}

function usageKeyOf(usage?: ContentUsageOpts): string {
  if (!usage?.usageSummaryLabels) return ''
  return `${usage.overviewUsageScope ?? ''}:${usage.usageSummaryLabels.singular}:${usage.usageSummaryLabels.plural}`
}

export function useFamilyTableConfig(
  campaignId: string,
  family: EquipmentFamilyPath,
  usage?: ContentUsageOpts,
) {
  const needsArmorRules = family === 'armor'
  const rulesQuery = useRulesetPatch(campaignId, needsArmorRules)
  const armorClassRules = rulesQuery.data?.mechanics.armorClass
  const rulesKey = armorClassRules ? `${armorClassRules.mode}:${armorClassRules.base}` : ''
  const usageKey = `${usageKeyOf(usage)}|${needsArmorRules ? rulesKey : ''}`
  const [loadState, setLoadState] = useState<FamilyTableLoadState>({
    campaignId,
    family,
    usageKey,
    tableConfig: null,
    isError: false,
  })

  useEffect(() => {
    let cancelled = false
    const usageOpts: ContentUsageOpts | undefined = usage?.usageSummaryLabels
      ? {
          usageSummaryLabels: usage.usageSummaryLabels,
          overviewUsageScope: usage.overviewUsageScope,
        }
      : undefined

    if (!(needsArmorRules && !armorClassRules)) {
      void loadFamilyTableConfig(campaignId, family, usageOpts, armorClassRules)
        .then((config) => {
          if (!cancelled) {
            setLoadState({ campaignId, family, usageKey, tableConfig: config, isError: false })
          }
        })
        .catch(() => {
          if (!cancelled) {
            setLoadState({ campaignId, family, usageKey, tableConfig: null, isError: true })
          }
        })
    }

    return () => {
      cancelled = true
    }
    // usageKey encodes usage opts — avoid depending on the usage object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- usageKey is the stable usage fingerprint
  }, [armorClassRules, campaignId, family, needsArmorRules, usageKey])

  const isStale =
    loadState.campaignId !== campaignId ||
    loadState.family !== family ||
    loadState.usageKey !== usageKey

  const rulesPending = needsArmorRules && rulesQuery.isPending
  const rulesError = needsArmorRules && rulesQuery.isError

  return {
    tableConfig: isStale || rulesPending || rulesError ? null : loadState.tableConfig,
    isPending:
      rulesPending ||
      isStale ||
      (loadState.tableConfig === null && !loadState.isError && !rulesError),
    isError: rulesError || (isStale ? false : loadState.isError),
  }
}
