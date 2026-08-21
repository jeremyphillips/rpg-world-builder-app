import type { LocationConnectionKindOptionsCopy } from '../../../lib/relationship/location-connection/location-connection-kind-options-copy'

import {
  resolveInverseCharacterKindDescription,
  resolveInverseOrganizationKindDescription,
} from './location-inverse-relationship-description'
import {
  resolveTerritorialKindOccupiedReason,
  TERRITORIAL_AUTHORITY_DRAWER,
} from './location-connection-surface-copy'

/** Default location-connected-parties copy wired into location-connection kind builders. */
export const LOCATION_CONNECTION_KIND_OPTIONS_COPY = {
  duplicateClaimReason: TERRITORIAL_AUTHORITY_DRAWER.duplicateClaimReason,
  resolveInverseOrganizationKindDescription,
  resolveInverseCharacterKindDescription,
  resolveTerritorialKindOccupiedReason,
} satisfies LocationConnectionKindOptionsCopy
