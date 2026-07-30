'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { ContentUsageBlocker, ResolvedContentCampaignAccess } from '@rpg/contracts'

export type CampaignAccessSaveResult =
  | { status: 'skipped' }
  | { status: 'updated'; campaignAccess: ResolvedContentCampaignAccess }
  | { status: 'blocked'; blockers: ContentUsageBlocker[] }
  | { status: 'invalid'; message: string }

export type CampaignAccessFormContextValue = {
  isDirty: boolean
  isPending: boolean
  save: () => Promise<CampaignAccessSaveResult>
  reset: () => void
  /** Read pending availability before save(); undefined when unavailable. */
  readPendingAvailable?: () => boolean | undefined
  /** True when the availability flag differs from persisted baseline. */
  readAccessAvailabilityChanged?: () => boolean | undefined
}

const defaultSave = async (): Promise<CampaignAccessSaveResult> => ({ status: 'skipped' })

export const DEFAULT_CAMPAIGN_ACCESS_PARTICIPANT: CampaignAccessFormContextValue = {
  isDirty: false,
  isPending: false,
  save: defaultSave,
  reset: () => {},
}

const CampaignAccessFormContext = createContext<CampaignAccessFormContextValue>(
  DEFAULT_CAMPAIGN_ACCESS_PARTICIPANT,
)

type ParticipantSnapshot = Pick<CampaignAccessFormContextValue, 'isDirty' | 'isPending'>

const ParticipantRegistryContext = createContext<
  ((bindings: CampaignAccessFormContextValue) => void) | null
>(null)

export interface CampaignAccessAvailabilityContextValue {
  pending: boolean
  onAvailableChange: (checked: boolean) => void | Promise<void>
}

const CampaignAccessAvailabilityContext =
  createContext<CampaignAccessAvailabilityContextValue | null>(null)

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
    setSnapshot({ isDirty: bindings.isDirty, isPending: bindings.isPending })
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

/** Section registers reactive participant bindings into provider-owned state. */
export function useCampaignAccessParticipantUpdater(bindings: CampaignAccessFormContextValue) {
  const register = useContext(ParticipantRegistryContext)
  if (!register) {
    throw new Error(
      'useCampaignAccessParticipantUpdater must be used within CampaignAccessFormProvider',
    )
  }

  const bindingsRef = useRef(bindings)
  bindingsRef.current = bindings

  useEffect(() => {
    register({
      isDirty: bindings.isDirty,
      isPending: bindings.isPending,
      save: () => bindingsRef.current.save(),
      reset: () => bindingsRef.current.reset(),
      readPendingAvailable: () => bindingsRef.current.readPendingAvailable?.(),
      readAccessAvailabilityChanged: () => bindingsRef.current.readAccessAvailabilityChanged?.(),
    })
    return () => register(DEFAULT_CAMPAIGN_ACCESS_PARTICIPANT)
  }, [bindings.isDirty, bindings.isPending, register])
}

/** Read-only participant state for shells, guards, and disclosure. */
export function useCampaignAccessForm(): CampaignAccessFormContextValue {
  return useContext(CampaignAccessFormContext)
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

export function useCampaignAccessAvailabilityContext(): CampaignAccessAvailabilityContextValue {
  const context = useContext(CampaignAccessAvailabilityContext)
  if (!context) {
    throw new Error(
      'useCampaignAccessAvailabilityContext must be used within CampaignAccessAvailabilityProvider',
    )
  }
  return context
}

/** @deprecated Use useCampaignAccessAvailabilityContext */
export function useCampaignAccessFormContext(): CampaignAccessAvailabilityContextValue {
  return useCampaignAccessAvailabilityContext()
}
