import { useEffect, useState } from 'react'

import {
  loadFamilyTableConfig,
  type FamilyTableConfig,
} from '../lib/shared/equipment-family-columns'
import type { EquipmentFamilyPath } from '../lib/shared/equipment-family-paths'

type FamilyTableLoadState = {
  campaignId: string
  family: EquipmentFamilyPath
  tableConfig: FamilyTableConfig | null
  isError: boolean
}

export function useFamilyTableConfig(campaignId: string, family: EquipmentFamilyPath) {
  const [loadState, setLoadState] = useState<FamilyTableLoadState>({
    campaignId,
    family,
    tableConfig: null,
    isError: false,
  })

  useEffect(() => {
    let cancelled = false

    void loadFamilyTableConfig(campaignId, family)
      .then((config) => {
        if (!cancelled) {
          setLoadState({ campaignId, family, tableConfig: config, isError: false })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadState({ campaignId, family, tableConfig: null, isError: true })
        }
      })

    return () => {
      cancelled = true
    }
  }, [campaignId, family])

  const isStale = loadState.campaignId !== campaignId || loadState.family !== family

  return {
    tableConfig: isStale ? null : loadState.tableConfig,
    isPending: isStale || (loadState.tableConfig === null && !loadState.isError),
    isError: isStale ? false : loadState.isError,
  }
}
