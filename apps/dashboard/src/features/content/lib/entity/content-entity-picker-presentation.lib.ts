import type { ReactNode } from 'react'
import type { Organization } from '@rpg/contracts'
import type { ContentCardDensity } from '@rpg/ui'

import { buildCharacterEntityCardModel } from '@/features/character/lib/display/character-entity-summary.lib'

import {
  buildLocationEntityCardModel,
  type LocationEntitySummaryVm,
} from '../../locations/lib/location-display'
import {
  buildConnectedPartyCharacterEntitySummary,
  type LocationConnectedPartyCharacterOption,
} from '../../locations/lib/connected-parties/location-connected-party-character-options.lib'
import {
  buildOrganizationEntityCardModel,
  buildOrganizationEntitySummaryVm,
} from '../../organizations/lib/organization-display'

import { projectEntitySurfaceIdentityToSummaryModel } from './surfaces/entity-surface-projection.lib'
import type { EntitySummaryModel } from './summary/entity-summary.types'

type EntitySummaryAdapterOptions = {
  description?: ReactNode
  density?: ContentCardDensity
}

function projectPickerIdentity(
  identity: ReturnType<typeof buildLocationEntityCardModel>,
  options: EntitySummaryAdapterOptions,
): EntitySummaryModel {
  const density = options.density ?? 'compact'
  const model = projectEntitySurfaceIdentityToSummaryModel(identity, density)

  if (options.description !== undefined) {
    return { ...model, description: options.description }
  }

  return model
}

export function buildLocationPickerEntitySummary(
  summary: LocationEntitySummaryVm,
  options: EntitySummaryAdapterOptions = {},
): EntitySummaryModel {
  return projectPickerIdentity(buildLocationEntityCardModel(summary), options)
}

export function buildOrganizationPickerEntitySummary(
  organization: Pick<
    Organization,
    'id' | 'name' | 'organizationDomain' | 'media' | 'slug' | 'source' | 'rulesetId'
  >,
  options: EntitySummaryAdapterOptions = {},
): EntitySummaryModel {
  return projectPickerIdentity(
    buildOrganizationEntityCardModel(buildOrganizationEntitySummaryVm(organization)),
    options,
  )
}

export function buildCharacterPickerEntitySummary(
  character: LocationConnectedPartyCharacterOption,
  options: EntitySummaryAdapterOptions = {},
): EntitySummaryModel {
  const vm = buildConnectedPartyCharacterEntitySummary(character)
  const identity = buildCharacterEntityCardModel(vm, { includeCharacterTypeInMetadata: true })

  const density = options.density ?? 'compact'
  const model = projectEntitySurfaceIdentityToSummaryModel(identity, density)

  if (options.description !== undefined) {
    return { ...model, description: options.description }
  }

  return model
}
