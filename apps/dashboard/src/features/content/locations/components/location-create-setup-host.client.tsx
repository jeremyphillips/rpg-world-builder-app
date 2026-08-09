'use client'

import {
  LOCATION_AUTHORING_TYPES_WITH_CREATE_SETUP,
  requiresLocationCreateSetup,
} from '../lib/location-authoring-type'
import type {
  LocationCreateIntent,
  LocationCreateSetupResult,
} from '../lib/location-create-session'
import { LocationCreateSetupSession } from './location-create-setup-session.client'

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
  if (!requiresLocationCreateSetup(intent.authoringType)) {
    throw new Error(
      `LocationCreateSetupHost requires a setup-gated authoring type (${LOCATION_AUTHORING_TYPES_WITH_CREATE_SETUP.join(', ')}); got ${intent.authoringType}`,
    )
  }

  return (
    <LocationCreateSetupSession
      open
      intent={intent}
      onOpenChange={onOpenChange}
      onComplete={onComplete}
    />
  )
}
