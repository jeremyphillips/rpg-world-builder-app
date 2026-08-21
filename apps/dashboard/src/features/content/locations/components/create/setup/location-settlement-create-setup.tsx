import type {
  LocationCreateIntent,
  LocationCreateSetupResult,
} from '../../../lib/create/session/location-create-session'
import { LocationCreateSetupSession } from './location-create-setup-session'

export type LocationSettlementCreateSetupProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  intent: LocationCreateIntent
  onComplete: (result: LocationCreateSetupResult) => void
}

/** Settlement-type setup before a fixed settlement create session opens. */
export function LocationSettlementCreateSetup(props: LocationSettlementCreateSetupProps) {
  return <LocationCreateSetupSession {...props} />
}
