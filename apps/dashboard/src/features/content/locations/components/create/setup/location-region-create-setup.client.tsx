'use client'

import type {
  LocationCreateIntent,
  LocationCreateSetupResult,
} from '../../../lib/create/session/location-create-session'
import { LocationCreateSetupSession } from './location-create-setup-session.client'

export type LocationRegionCreateSetupProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  intent: LocationCreateIntent
  onComplete: (result: LocationCreateSetupResult) => void
}

/** Region classification + type setup before a fixed region create session opens. */
export function LocationRegionCreateSetup(props: LocationRegionCreateSetupProps) {
  return <LocationCreateSetupSession {...props} />
}
