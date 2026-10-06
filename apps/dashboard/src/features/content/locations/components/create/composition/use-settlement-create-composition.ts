import { createContext, useContext } from 'react'

import type { SettlementCreateComposition } from '../../../lib/create/composition/location-settlement-create-composition.lib'

export type SettlementCreateCompositionContextValue = {
  composition: SettlementCreateComposition
  isDirty: boolean
  addDistrict: () => void
  updateDistrict: (districtId: string, name: string) => void
  removeDistrict: (districtId: string) => void
}

export const SettlementCreateCompositionContext =
  createContext<SettlementCreateCompositionContextValue | null>(null)

export function useSettlementCreateComposition(): SettlementCreateCompositionContextValue {
  const context = useContext(SettlementCreateCompositionContext)
  if (!context) {
    throw new Error(
      'useSettlementCreateComposition must be used within SettlementCreateCompositionProvider',
    )
  }
  return context
}
