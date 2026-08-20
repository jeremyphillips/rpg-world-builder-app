'use client'

import type {
  LocationCreateIntent,
  LocationCreateSetupResult,
} from '../lib/create/session/location-create-session'
import { LocationCreateSetupSession } from './location-create-setup-session.client'

export type LocationSiteCreateSetupProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  intent: LocationCreateIntent
  onComplete: (result: LocationCreateSetupResult) => void
}

/** Site-type setup before a fixed site create session opens. */
export function LocationSiteCreateSetup(props: LocationSiteCreateSetupProps) {
  return <LocationCreateSetupSession {...props} />
}
