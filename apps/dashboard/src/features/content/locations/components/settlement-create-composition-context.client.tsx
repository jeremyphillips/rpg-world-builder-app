'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import {
  EMPTY_SETTLEMENT_CREATE_COMPOSITION,
  addSettlementDistrictDraft,
  isSettlementCreateCompositionDirty,
  removeSettlementDistrictDraft,
  updateSettlementDistrictDraft,
  type SettlementCreateComposition,
} from '../lib/location-settlement-create-composition.lib'

type SettlementCreateCompositionContextValue = {
  composition: SettlementCreateComposition
  isDirty: boolean
  addDistrict: () => void
  updateDistrict: (districtId: string, name: string) => void
  removeDistrict: (districtId: string) => void
}

const SettlementCreateCompositionContext =
  createContext<SettlementCreateCompositionContextValue | null>(null)

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

export function useSettlementCreateComposition(): SettlementCreateCompositionContextValue {
  const context = useContext(SettlementCreateCompositionContext)
  if (!context) {
    throw new Error(
      'useSettlementCreateComposition must be used within SettlementCreateCompositionProvider',
    )
  }
  return context
}
