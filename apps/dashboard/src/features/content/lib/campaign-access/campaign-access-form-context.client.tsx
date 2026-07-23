'use client'

import { createContext, useContext, type ReactNode } from 'react'

export interface CampaignAccessFormContextValue {
  pending: boolean
  onAvailableChange: (checked: boolean) => void | Promise<void>
}

const CampaignAccessFormContext = createContext<CampaignAccessFormContextValue | null>(null)

export interface CampaignAccessFormProviderProps {
  value: CampaignAccessFormContextValue
  children: ReactNode
}

export function CampaignAccessFormProvider({ value, children }: CampaignAccessFormProviderProps) {
  return (
    <CampaignAccessFormContext.Provider value={value}>
      {children}
    </CampaignAccessFormContext.Provider>
  )
}

export function useCampaignAccessFormContext(): CampaignAccessFormContextValue {
  const context = useContext(CampaignAccessFormContext)
  if (!context) {
    throw new Error('useCampaignAccessFormContext must be used within CampaignAccessFormProvider')
  }
  return context
}
