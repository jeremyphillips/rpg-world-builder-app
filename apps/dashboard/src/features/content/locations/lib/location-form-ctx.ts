import type { SettlementType } from '@rpg/contracts'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'

import type { LocationAuthoringType } from './location-authoring-type'

export type LocationFixedCreateContext = {
  authoringType: LocationAuthoringType
  parent?: { kind: 'fixed'; locationId: string }
  settlementType?: SettlementType
}

export type LocationFormCtx = ContentFormCtx & {
  fixedCreate?: LocationFixedCreateContext
}
