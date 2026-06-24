import type { Equipment } from '@rpg/contracts'

import { weightFromForm } from '../../lib/content-form-field-helpers'
import { slugForInputParse } from '../../lib/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/content-form-registry'

import type { EquipmentFormValues } from './equipment-form-def'

export type EquipmentInputBuildCtx = {
  values: EquipmentFormValues
  ctx?: ContentFormInputCtx<Equipment>
  weight: ReturnType<typeof weightFromForm>
}

/** Shared identity/cost fields for all equipment kind input builders. */
export function equipmentInputBase(
  values: EquipmentFormValues,
  ctx?: ContentFormInputCtx<Equipment>,
): Pick<EquipmentFormValues, 'name' | 'cost'> & { description?: string; slug: string } {
  return {
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    cost: values.cost,
  }
}
