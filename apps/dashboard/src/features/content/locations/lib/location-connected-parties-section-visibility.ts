import type { Location, LocationConnectedPartyRow } from '@rpg/contracts'
import {
  getOrganizationLocationConnectionFamily,
  resolveLocationConnectionEligibility,
} from '@rpg/contracts'

import { toLocationConnectionEligibilityInput } from '../../lib/relationship/location-connection/location-connection-eligibility-input'

export type LocationConnectedPartiesSectionEligibility = {
  territorialAuthority: boolean
  peopleAndOrganizations: boolean
}

export function resolveLocationConnectedPartiesSectionEligibility(
  location: Location,
): LocationConnectedPartiesSectionEligibility {
  const eligibility = resolveLocationConnectionEligibility(
    toLocationConnectionEligibilityInput(location),
  )

  const territorialAuthority = eligibility.organizationKinds.some(
    (kind) => getOrganizationLocationConnectionFamily(kind) === 'territorial_authority',
  )

  const peopleAndOrganizations =
    eligibility.organizationKinds.some(
      (kind) => getOrganizationLocationConnectionFamily(kind) !== 'territorial_authority',
    ) || eligibility.characterKinds.length > 0

  return {
    territorialAuthority,
    peopleAndOrganizations,
  }
}

export function shouldShowLocationConnectedPartiesSection(input: {
  section: keyof LocationConnectedPartiesSectionEligibility
  eligibility: LocationConnectedPartiesSectionEligibility
  canManage: boolean
  rows: readonly LocationConnectedPartyRow[]
  sectionGroup: LocationConnectedPartyRow['sectionGroup']
}): boolean {
  if (!input.eligibility[input.section]) {
    return false
  }

  if (input.canManage) {
    return true
  }

  return input.rows.some((row) => row.sectionGroup === input.sectionGroup)
}
