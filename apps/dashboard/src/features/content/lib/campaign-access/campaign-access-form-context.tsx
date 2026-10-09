import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'

import {
  CampaignAccessAvailabilityContext,
  CampaignAccessFormContext,
  DEFAULT_CAMPAIGN_ACCESS_PARTICIPANT,
  ParticipantRegistryContext,
  type CampaignAccessAvailabilityContextValue,
  type CampaignAccessFormContextValue,
} from './campaign-access-form-state'

export type {
  CampaignAccessAvailabilityContextValue,
  CampaignAccessFormContextValue,
  CampaignAccessSaveResult,
} from './campaign-access-form-state'

type ParticipantSnapshot = Pick<
  CampaignAccessFormContextValue,
  'isDirty' | 'isPending' | 'pendingAccess'
>

export function CampaignAccessFormProvider({ children }: { children: ReactNode }) {
  const saveRef = useRef(DEFAULT_CAMPAIGN_ACCESS_PARTICIPANT.save)
  const resetRef = useRef(DEFAULT_CAMPAIGN_ACCESS_PARTICIPANT.reset)
  const readPendingAvailableRef =
    useRef<CampaignAccessFormContextValue['readPendingAvailable']>(undefined)
  const readAccessAvailabilityChangedRef =
    useRef<CampaignAccessFormContextValue['readAccessAvailabilityChanged']>(undefined)
  const [snapshot, setSnapshot] = useState<ParticipantSnapshot>({
    isDirty: false,
    isPending: false,
  })

  const registerParticipant = useCallback((bindings: CampaignAccessFormContextValue) => {
    saveRef.current = bindings.save
    resetRef.current = bindings.reset
    readPendingAvailableRef.current = bindings.readPendingAvailable
    readAccessAvailabilityChangedRef.current = bindings.readAccessAvailabilityChanged
    setSnapshot({
      isDirty: bindings.isDirty,
      isPending: bindings.isPending,
      pendingAccess: bindings.pendingAccess,
    })
  }, [])

  const value = useMemo<CampaignAccessFormContextValue>(
    () => ({
      ...snapshot,
      save: () => saveRef.current(),
      reset: () => resetRef.current(),
      readPendingAvailable: () => readPendingAvailableRef.current?.(),
      readAccessAvailabilityChanged: () => readAccessAvailabilityChangedRef.current?.(),
    }),
    [snapshot],
  )

  return (
    <ParticipantRegistryContext.Provider value={registerParticipant}>
      <CampaignAccessFormContext.Provider value={value}>
        {children}
      </CampaignAccessFormContext.Provider>
    </ParticipantRegistryContext.Provider>
  )
}

export function CampaignAccessAvailabilityProvider({
  value,
  children,
}: {
  value: CampaignAccessAvailabilityContextValue
  children: ReactNode
}) {
  return (
    <CampaignAccessAvailabilityContext.Provider value={value}>
      {children}
    </CampaignAccessAvailabilityContext.Provider>
  )
}
