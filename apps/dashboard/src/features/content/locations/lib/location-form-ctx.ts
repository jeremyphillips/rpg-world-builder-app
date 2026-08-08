import type { ContentFormCtx } from '../../lib/forms/content-form-registry'

import type { LocationAuthoringType } from './location-authoring-type'

export type LocationFixedCreateContext = {
  authoringType: LocationAuthoringType
  parentLocationId: string
}

export type LocationFormCtx = ContentFormCtx & {
  fixedCreate?: LocationFixedCreateContext
}
