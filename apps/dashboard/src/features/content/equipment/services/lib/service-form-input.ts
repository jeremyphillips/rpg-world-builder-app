import { createEquipmentInputSchema, type CreateEquipmentInput } from '@rpg/contracts'

import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-input-base'
import { durationFromForm } from './service-form-fields'

/** Maps service form values to a create/update API input fragment. */
export function buildServiceInput({ values, ctx }: EquipmentInputBuildCtx): CreateEquipmentInput {
  const duration = durationFromForm(values.duration)

  return createEquipmentInputSchema.parse({
    ...equipmentInputBase(values, ctx),
    kind: 'service',
    serviceCategory: values.serviceCategory ?? 'other',
    ...(duration && { duration }),
    ...(values.notes && { notes: values.notes }),
  })
}
