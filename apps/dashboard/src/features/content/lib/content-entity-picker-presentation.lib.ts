import type { ReactNode } from 'react'
import type { Organization } from '@rpg/contracts'
import { getOrganizationKindLabel } from '@rpg/contracts'
import type { ContentCardDensity } from '@rpg/ui'

import { buildCharacterEntityContextPresentation } from '@/features/character'

import {
  buildLocationEntityContextPresentation,
  type LocationEntitySummaryVm,
} from '../locations/lib/location-display'
import {
  buildConnectedPartyCharacterEntitySummary,
  type LocationConnectedPartyCharacterOption,
} from '../locations/lib/location-connected-party-character-options.lib'

import { buildEntityMediaFromImageKey } from './entity/entity-media.lib'
import type { EntitySummaryModel } from './entity/entity-summary.types'

type EntitySummaryAdapterOptions = {
  imageKey?: string
  description?: ReactNode
  density?: ContentCardDensity
}

function resolveEntityMedia(
  imageKey: string | undefined,
  heading: EntitySummaryModel['heading'],
  density: ContentCardDensity,
): ReactNode | undefined {
  if (!imageKey) {
    return undefined
  }

  const alt = typeof heading === 'string' ? heading : ''
  return buildEntityMediaFromImageKey(imageKey, alt, density)
}

function stripLeadingClassificationSeparator(classification: string): string {
  return classification.startsWith(' · ') ? classification.slice(3) : classification
}

export function buildLocationPickerEntitySummary(
  summary: LocationEntitySummaryVm,
  options: EntitySummaryAdapterOptions = {},
): EntitySummaryModel {
  const presentation = buildLocationEntityContextPresentation(summary)
  const density = options.density ?? 'compact'

  return {
    heading: presentation.heading,
    classification: presentation.headingSuffix
      ? stripLeadingClassificationSeparator(presentation.headingSuffix)
      : undefined,
    description: options.description ?? presentation.supportingText,
    media: resolveEntityMedia(options.imageKey ?? summary.imageKey, presentation.heading, density),
  }
}

export function buildOrganizationPickerEntitySummary(
  organization: Pick<Organization, 'name' | 'organizationKind' | 'imageKey'>,
  options: EntitySummaryAdapterOptions = {},
): EntitySummaryModel {
  const density = options.density ?? 'compact'

  return {
    heading: organization.name,
    classification: getOrganizationKindLabel(organization.organizationKind),
    description: options.description,
    media: resolveEntityMedia(
      options.imageKey ?? organization.imageKey,
      organization.name,
      density,
    ),
  }
}

export function buildCharacterPickerEntitySummary(
  character: LocationConnectedPartyCharacterOption,
  options: EntitySummaryAdapterOptions = {},
): EntitySummaryModel {
  const presentation = buildCharacterEntityContextPresentation(
    buildConnectedPartyCharacterEntitySummary(character),
  )
  const density = options.density ?? 'compact'

  return {
    heading: presentation.heading,
    classification: presentation.headingSuffix
      ? stripLeadingClassificationSeparator(presentation.headingSuffix)
      : undefined,
    description: options.description ?? presentation.supportingText,
    media: resolveEntityMedia(options.imageKey, presentation.heading, density),
  }
}
