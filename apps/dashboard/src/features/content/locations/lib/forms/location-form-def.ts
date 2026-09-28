import type { CreateLocationInput, Location } from '@rpg/contracts'

import {
  contentFormRegistry,
  type ContentFormDef,
} from '../../../lib/forms/registry/content-form-registry'
import { managedMediaFormDefFields } from '../../../lib/forms/registry/managed-media-form-def.lib'
import { locationsQueryKey, useLocations } from '../../hooks/use-locations'
import {
  buildLocationFields,
  locationDraftFormSchema,
  locationFormSchema,
  locationNameField,
  type LocationFormValues,
} from './location-form-fields'
import { locationFormValueSyncs } from './location-form-sync'
import {
  buildLocationCreateInput,
  locationCreateDefaultValues,
  locationToFormValues,
} from './location-form-values'

const locationFormDef: ContentFormDef<Location, LocationFormValues, CreateLocationInput> = {
  routeKey: 'locations',
  ...managedMediaFormDefFields('locations'),
  schema: locationFormSchema,
  draftSchema: locationDraftFormSchema,
  coverage: 'structural',
  nameField: locationNameField,
  createDefaultValues: locationCreateDefaultValues,
  buildFields: buildLocationFields,
  valueSyncs: locationFormValueSyncs,
  enrichEditLayoutCtx: (ctx, entity) => ({
    ...ctx,
    ...(entity.parentLocationId ? { locationParentLocationIdSeed: entity.parentLocationId } : {}),
  }),
  toFormValues: locationToFormValues,
  toInput: buildLocationCreateInput,
  useListQuery: useLocations,
  queryKey: locationsQueryKey,
}

contentFormRegistry.locations = locationFormDef

export { locationFormDef, locationFormSchema, locationDraftFormSchema }
