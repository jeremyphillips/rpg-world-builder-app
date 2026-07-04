import {
  createEquipmentInputSchema,
  type CreateEquipmentInput,
  type ServiceDuration,
  type ServiceDurationUnit,
  type ServiceEquipment,
} from '@rpg/contracts'

import {
  equipmentInputBase,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-values-base'
import type { ServiceEquipmentFormValues } from '../../lib/equipment-form-fields'

export function durationFromForm(
  duration: { value?: number; unit?: ServiceDurationUnit } | undefined,
): ServiceDuration | undefined {
  const value = duration?.value
  const unit = duration?.unit
  if (value === undefined || Number.isNaN(value) || !unit) return undefined
  return { value, unit }
}

export function durationToForm(
  duration: ServiceDuration | undefined,
): ServiceEquipmentFormValues['duration'] {
  return duration ? { value: duration.value, unit: duration.unit } : undefined
}

export function serviceFormValuesFromEntity(
  item: ServiceEquipment,
): Pick<ServiceEquipmentFormValues, 'serviceCategory' | 'duration' | 'notes'> {
  return {
    serviceCategory: item.serviceCategory,
    duration: durationToForm(item.duration),
    notes: item.notes,
  }
}

/** Maps service form values to a create/update API input fragment. */
export function buildServiceInput({
  values,
  ctx,
}: EquipmentInputBuildCtx<'service'>): CreateEquipmentInput {
  const duration = durationFromForm(values.duration)

  return createEquipmentInputSchema.parse({
    ...equipmentInputBase(values, ctx),
    kind: 'service',
    serviceCategory: values.serviceCategory ?? 'other',
    ...(duration && { duration }),
    ...(values.notes && { notes: values.notes }),
  })
}
