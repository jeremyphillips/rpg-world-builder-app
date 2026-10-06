import { createContext, useContext, useEffect, useRef } from 'react'
import type {
  ContentCampaignAccessPatch,
  ContentUsageBlocker,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'

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
  /** Live campaign-access draft for preview identity (nested RHF form). */
  pendingAccess?: ContentCampaignAccessPatch
}

const defaultSave = async (): Promise<CampaignAccessSaveResult> => ({ status: 'skipped' })

export const DEFAULT_CAMPAIGN_ACCESS_PARTICIPANT: CampaignAccessFormContextValue = {
  isDirty: false,
  isPending: false,
  save: defaultSave,
  reset: () => {},
}

export const CampaignAccessFormContext = createContext<CampaignAccessFormContextValue>(
  DEFAULT_CAMPAIGN_ACCESS_PARTICIPANT,
)

export const ParticipantRegistryContext = createContext<
  ((bindings: CampaignAccessFormContextValue) => void) | null
>(null)

export interface CampaignAccessAvailabilityContextValue {
  pending: boolean
  onAvailableChange: (checked: boolean) => void | Promise<void>
}

export const CampaignAccessAvailabilityContext =
  createContext<CampaignAccessAvailabilityContextValue | null>(null)

/** Section registers reactive participant bindings into provider-owned state. */
export function useCampaignAccessParticipantUpdater(bindings: CampaignAccessFormContextValue) {
  const register = useContext(ParticipantRegistryContext)
  if (!register) {
    throw new Error(
      'useCampaignAccessParticipantUpdater must be used within CampaignAccessFormProvider',
    )
  }

  const bindingsRef = useRef(bindings)

  useEffect(() => {
    bindingsRef.current = bindings
  })

  useEffect(() => {
    register({
      isDirty: bindings.isDirty,
      isPending: bindings.isPending,
      pendingAccess: bindings.pendingAccess,
      save: () => bindingsRef.current.save(),
      reset: () => bindingsRef.current.reset(),
      readPendingAvailable: () => bindingsRef.current.readPendingAvailable?.(),
      readAccessAvailabilityChanged: () => bindingsRef.current.readAccessAvailabilityChanged?.(),
    })
    return () => register(DEFAULT_CAMPAIGN_ACCESS_PARTICIPANT)
  }, [bindings.isDirty, bindings.isPending, bindings.pendingAccess, register])
}

/** Read-only participant state for shells, guards, and disclosure. */
export function useCampaignAccessForm(): CampaignAccessFormContextValue {
  return useContext(CampaignAccessFormContext)
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
