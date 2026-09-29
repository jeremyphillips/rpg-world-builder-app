import {
  buildLocationCreateInitialValues,
  type LocationCreatePrefill,
} from '../location-create-shortcuts'
import type { LocationFormCtx } from '../../forms/location-form-ctx'

export function resolveLocationCreatePageModel(
  prefill: LocationCreatePrefill,
  softParentLocationId: string | undefined,
  primaryWorldId: string | undefined,
): {
  formCtx?: LocationFormCtx
  initialValues?: Record<string, unknown>
} {
  const defaultParentLocationId = prefill.parentLocationId ?? softParentLocationId ?? primaryWorldId

  const formCtx: LocationFormCtx | undefined = prefill.facilityGroup
    ? { buildingFacilityAuthoringGroup: prefill.facilityGroup }
    : undefined

  return {
    formCtx,
    initialValues: buildLocationCreateInitialValues(
      { ...prefill, parentLocationId: defaultParentLocationId },
      { parentLocationId: defaultParentLocationId },
    ),
  }
}
