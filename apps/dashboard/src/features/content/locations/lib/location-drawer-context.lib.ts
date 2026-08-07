import type { Location } from '@rpg/contracts'
import { resolveLocationClassificationDisplay } from '@rpg/contracts'

import type { DrawerContextEntityPresentation } from '../../lib/relationship/drawer-context.types'

import {
  buildLocationContextPresentationFromLocation,
  buildLocationsById,
} from './location-display'

export function buildLocationDrawerContextPresentation(
  location: Location,
  ctx?: {
    locationsById?: ReadonlyMap<string, Location>
    campaignId?: string
    href?: string
  },
): DrawerContextEntityPresentation {
  if (ctx?.locationsById && ctx.campaignId) {
    return buildLocationContextPresentationFromLocation(location, {
      locationsById: ctx.locationsById,
      campaignId: ctx.campaignId,
      href: ctx.href,
    })
  }

  const classification = resolveLocationClassificationDisplay(location)
  return {
    heading: location.name,
    headingSuffix: classification.text ? ` · ${classification.text}` : undefined,
  }
}

export function buildLocationDrawerContextFromCampaignLocations(
  location: Location,
  campaignLocations: readonly Location[],
): DrawerContextEntityPresentation {
  const campaignId = location.campaignId ?? campaignLocations[0]?.campaignId ?? ''
  return buildLocationDrawerContextPresentation(location, {
    locationsById: buildLocationsById(campaignLocations),
    campaignId,
  })
}
