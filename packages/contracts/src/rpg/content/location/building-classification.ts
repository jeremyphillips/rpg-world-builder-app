import { z } from 'zod'

import { buildingFacilityTypeSchema } from '../../vocab/location/building/building-facility-type'
import { buildingFormSchema } from '../../vocab/location/building/building-form'

export const buildingClassificationSchema = z
  .object({
    form: buildingFormSchema.optional(),
    facilityType: buildingFacilityTypeSchema.optional(),
  })
  .refine((value) => value.form !== undefined || value.facilityType !== undefined, {
    message: 'Building classification must include a form or facility type.',
  })

export type BuildingClassification = z.infer<typeof buildingClassificationSchema>
