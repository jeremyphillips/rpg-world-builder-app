'use client'

import { useCallback, useState } from 'react'

import {
  completeLocationCreateSetup,
  resolveLocationCreateSession,
  type LocationCreateIntent,
} from '../lib/location-create-session'
import type { LocationFixedCreateContext } from '../lib/location-form-ctx'
import { LocationSettlementCreateSetup } from './location-settlement-create-setup.client'

export function useLocationCreateSessionLaunch(options: {
  onReady: (fixedCreate: LocationFixedCreateContext) => void
}) {
  const [setupIntent, setSetupIntent] = useState<LocationCreateIntent | null>(null)

  const launch = useCallback(
    (intent: LocationCreateIntent) => {
      const session = resolveLocationCreateSession(intent)
      if (session.status === 'needsSetup') {
        setSetupIntent(intent)
        return
      }
      options.onReady(session.fixedCreate)
    },
    [options],
  )

  const setupHost =
    setupIntent !== null ? (
      <LocationSettlementCreateSetup
        open
        intent={setupIntent}
        onOpenChange={(open) => {
          if (!open) setSetupIntent(null)
        }}
        onComplete={(result) => {
          options.onReady(completeLocationCreateSetup(setupIntent, result))
          setSetupIntent(null)
        }}
      />
    ) : null

  return { launch, setupHost }
}
