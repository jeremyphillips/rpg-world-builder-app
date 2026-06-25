import { useEffect, useState } from 'react'

import {
  loadFamilyTableConfig,
  type FamilyTableConfig,
} from '../lib/shared/equipment-family-columns'
import type { EquipmentFamilyPath } from '../lib/shared/equipment-family-paths'

export function useFamilyTableConfig(campaignId: string, family: EquipmentFamilyPath) {
  const [tableConfig, setTableConfig] = useState<FamilyTableConfig | null>(null)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setTableConfig(null)
    setIsError(false)

    void loadFamilyTableConfig(campaignId, family)
      .then((config) => {
        if (!cancelled) setTableConfig(config)
      })
      .catch(() => {
        if (!cancelled) setIsError(true)
      })

    return () => {
      cancelled = true
    }
  }, [campaignId, family])

  return {
    tableConfig,
    isPending: tableConfig === null && !isError,
    isError,
  }
}
