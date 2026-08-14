import type {
  BuildingFacilityAuthoringGroup,
  BuildingForm,
  LocationKind,
  RegionClassification,
  SettlementType,
  SiteType,
} from '@rpg/contracts'

import { requiresLocationCreateSetup, type LocationAuthoringType } from './location-authoring-type'
import type { LocationFixedCreateContext } from './location-form-ctx'

export type LocationCreateIntent = {
  authoringType: LocationAuthoringType
  /** Contained create supplies a fixed parent; overview typed create omits this. */
  parentLocationId?: string
  /** Parent kind for contextual copy (Subregion vs Region) when known at launch. */
  parentKind?: LocationKind
}

export type LocationCreateSetupResult =
  | {
      kind: 'building'
      form?: BuildingForm
      facilityAuthoringGroup?: BuildingFacilityAuthoringGroup
    }
  | { kind: 'settlement'; settlementType: SettlementType }
  | { kind: 'region'; classification: RegionClassification }
  | { kind: 'site'; siteType: SiteType }

export type LocationCreateSession =
  | { status: 'needsSetup' }
  | { status: 'ready'; fixedCreate: LocationFixedCreateContext }

/** Maps create intent to a fixed session or setup gate — pure, no shell knowledge. */
export function resolveLocationCreateSession(intent: LocationCreateIntent): LocationCreateSession {
  if (requiresLocationCreateSetup(intent.authoringType)) {
    return { status: 'needsSetup' }
  }

  return { status: 'ready', fixedCreate: fixedCreateFromIntent(intent) }
}

/** Builds fixed create context from intent without setup fields. */
export function fixedCreateFromIntent(intent: LocationCreateIntent): LocationFixedCreateContext {
  const fixedCreate: LocationFixedCreateContext = {
    authoringType: intent.authoringType,
  }

  if (intent.parentLocationId) {
    fixedCreate.parent = { kind: 'fixed', locationId: intent.parentLocationId }
  }

  if (intent.parentKind) {
    fixedCreate.parentKind = intent.parentKind
  }

  return fixedCreate
}

/** Pure completion of a setup-gated create intent into a fixed session. */
export function completeLocationCreateSetup(
  intent: LocationCreateIntent,
  setupResult: LocationCreateSetupResult,
): LocationFixedCreateContext {
  const base = fixedCreateFromIntent(intent)

  switch (setupResult.kind) {
    case 'building':
      return base
    case 'settlement':
      return { ...base, settlementType: setupResult.settlementType }
    case 'region':
      return { ...base, classification: setupResult.classification }
    case 'site':
      return { ...base, siteType: setupResult.siteType }
  }
}
