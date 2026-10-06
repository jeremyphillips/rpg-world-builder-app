import { useMemo, useState, type ReactNode } from 'react'

import {
  EMPTY_SETTLEMENT_CREATE_COMPOSITION,
  addSettlementDistrictDraft,
  isSettlementCreateCompositionDirty,
  removeSettlementDistrictDraft,
  updateSettlementDistrictDraft,
} from '../../../lib/create/composition/location-settlement-create-composition.lib'
import {
  SettlementCreateCompositionContext,
  type SettlementCreateCompositionContextValue,
} from './use-settlement-create-composition'

export function SettlementCreateCompositionProvider({ children }: { children: ReactNode }) {
  const [composition, setComposition] = useState(EMPTY_SETTLEMENT_CREATE_COMPOSITION)

  const value = useMemo(
    (): SettlementCreateCompositionContextValue => ({
      composition,
      isDirty: isSettlementCreateCompositionDirty(composition),
      addDistrict: () => {
        setComposition((current) => addSettlementDistrictDraft(current))
      },
      updateDistrict: (districtId, name) => {
        setComposition((current) => updateSettlementDistrictDraft(current, districtId, name))
      },
      removeDistrict: (districtId) => {
        setComposition((current) => removeSettlementDistrictDraft(current, districtId))
      },
    }),
    [composition],
  )

  return (
    <SettlementCreateCompositionContext.Provider value={value}>
      {children}
    </SettlementCreateCompositionContext.Provider>
  )
}
