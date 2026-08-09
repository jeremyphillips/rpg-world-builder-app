'use client'

import type {
  LocationCreateIntent,
  LocationCreateSetupResult,
} from '../lib/location-create-session'
import { LocationRegionCreateSetup } from './location-region-create-setup.client'
import { LocationSettlementCreateSetup } from './location-settlement-create-setup.client'
import { LocationSiteCreateSetup } from './location-site-create-setup.client'

export type LocationCreateSetupHostProps = {
  intent: LocationCreateIntent
  onOpenChange: (open: boolean) => void
  onComplete: (result: LocationCreateSetupResult) => void
}

/** Renders the setup modal for a setup-gated authoring type. */
export function LocationCreateSetupHost({
  intent,
  onOpenChange,
  onComplete,
}: LocationCreateSetupHostProps) {
  if (intent.authoringType === 'settlement') {
    return (
      <LocationSettlementCreateSetup
        open
        intent={intent}
        onOpenChange={onOpenChange}
        onComplete={onComplete}
      />
    )
  }

  if (intent.authoringType === 'region') {
    return (
      <LocationRegionCreateSetup
        open
        intent={intent}
        onOpenChange={onOpenChange}
        onComplete={onComplete}
      />
    )
  }

  if (intent.authoringType === 'site') {
    return (
      <LocationSiteCreateSetup
        open
        intent={intent}
        onOpenChange={onOpenChange}
        onComplete={onComplete}
      />
    )
  }

  return null
}
