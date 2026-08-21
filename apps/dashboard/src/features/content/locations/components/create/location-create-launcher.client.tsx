'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import {
  completeLocationCreateSetup,
  resolveLocationCreateSession,
  type LocationCreateIntent,
} from '../../lib/create/session/location-create-session'
import type { LocationFixedCreateContext } from '../../lib/forms/location-form-ctx'
import { LocationCreateSetupHost } from './setup/location-create-setup-host.client'

export function useLocationCreateSessionLaunch(
  onReady: (fixedCreate: LocationFixedCreateContext) => void,
) {
  const [setupIntent, setSetupIntent] = useState<LocationCreateIntent | null>(null)
  const onReadyRef = useRef(onReady)

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  const launch = useCallback((intent: LocationCreateIntent) => {
    const session = resolveLocationCreateSession(intent)
    if (session.status === 'needsSetup') {
      setSetupIntent(intent)
      return
    }
    onReadyRef.current(session.fixedCreate)
  }, [])

  const setupHost =
    setupIntent !== null ? (
      <LocationCreateSetupHost
        intent={setupIntent}
        onOpenChange={(open) => {
          if (!open) setSetupIntent(null)
        }}
        onComplete={(result) => {
          onReadyRef.current(completeLocationCreateSetup(setupIntent, result))
          setSetupIntent(null)
        }}
      />
    ) : null

  return { launch, setupHost }
}
