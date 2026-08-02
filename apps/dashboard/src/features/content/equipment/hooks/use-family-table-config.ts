import { useEffect, useState } from 'react'
import type { ContentOverviewUsageScope, ContentUsageSummaryLabels } from '@rpg/contracts'

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
  const usageKey = usageKeyOf(usage)
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

    void loadFamilyTableConfig(campaignId, family, usageOpts)
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

    return () => {
      cancelled = true
    }
    // usageKey encodes usage opts — avoid depending on the usage object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- usageKey is the stable usage fingerprint
  }, [campaignId, family, usageKey])

  const isStale =
    loadState.campaignId !== campaignId ||
    loadState.family !== family ||
    loadState.usageKey !== usageKey

  return {
    tableConfig: isStale ? null : loadState.tableConfig,
    isPending: isStale || (loadState.tableConfig === null && !loadState.isError),
    isError: isStale ? false : loadState.isError,
  }
}
