import type { LocationKind, RegionClassification, SettlementType, SiteType } from '@rpg/contracts'

import type { ContentFormCtx } from '../../../lib/forms/content-form-registry'

import type { LocationAuthoringType } from '../location-authoring-type'

export type LocationFixedCreateContext = {
  authoringType: LocationAuthoringType
  parent?: { kind: 'fixed'; locationId: string }
  /** Parent kind for contextual create copy when known. */
  parentKind?: LocationKind
  settlementType?: SettlementType
  siteType?: SiteType
  classification?: RegionClassification
}

export type LocationFormCtx = ContentFormCtx & {
  fixedCreate?: LocationFixedCreateContext
}
