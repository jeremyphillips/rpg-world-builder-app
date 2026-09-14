import type { ResolvedSubclass } from '@rpg/contracts'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import {
  buildMasterDetailAvailabilityPresentation,
  type MasterDetailAvailabilityPresentation,
} from '../../../lib/master-detail/master-detail-availability.types'
import type { SubclassListItem } from './subclass-editor-state'

export function resolveSubclassAvailability(
  subclassId: string,
  subclasses: readonly ResolvedSubclass[],
  accessOverrides: Readonly<Record<string, boolean>>,
): boolean {
  if (subclassId in accessOverrides) {
    return accessOverrides[subclassId]!
  }

  const entity = subclasses.find((subclass) => subclass.id === subclassId)
  return entity?.campaignAccess.available ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS.available
}

export function buildSubclassAvailabilityPresentations(
  listItems: readonly SubclassListItem[],
  subclasses: readonly ResolvedSubclass[],
  accessOverrides: Readonly<Record<string, boolean>>,
): MasterDetailAvailabilityPresentation[] {
  return listItems.map((item) =>
    buildMasterDetailAvailabilityPresentation(
      item.id,
      resolveSubclassAvailability(item.id, subclasses, accessOverrides),
    ),
  )
}
