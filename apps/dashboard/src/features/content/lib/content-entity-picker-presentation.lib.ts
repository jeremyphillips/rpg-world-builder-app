import type { Organization } from '@rpg/contracts'
import { getOrganizationKindLabel } from '@rpg/contracts'

import {
  buildLocationEntityContextPresentation,
  type LocationEntitySummaryVm,
} from '../locations/lib/location-display'
import {
  buildConnectedPartyCharacterEntitySummary,
  type LocationConnectedPartyCharacterOption,
} from '../locations/lib/location-connected-party-character-options.lib'

export type ContentEntityPickerCardPresentation = {
  heading: string
  headingSuffix?: string
  metadata?: string
}

export function buildLocationPickerCardPresentation(
  summary: LocationEntitySummaryVm,
): ContentEntityPickerCardPresentation {
  const presentation = buildLocationEntityContextPresentation(summary)

  return {
    heading: presentation.heading,
    headingSuffix: presentation.headingSuffix,
    metadata: presentation.supportingText,
  }
}

export function buildOrganizationPickerCardPresentation(
  organization: Pick<Organization, 'name' | 'organizationKind'>,
): ContentEntityPickerCardPresentation {
  return {
    heading: organization.name,
    headingSuffix: ` · ${getOrganizationKindLabel(organization.organizationKind)}`,
  }
}

export function buildCharacterPickerCardPresentation(
  character: LocationConnectedPartyCharacterOption,
): ContentEntityPickerCardPresentation {
  const summary = buildConnectedPartyCharacterEntitySummary(character)

  return {
    heading: summary.name,
    headingSuffix: ` · ${summary.characterType.label}`,
    metadata: summary.identitySummary || undefined,
  }
}
