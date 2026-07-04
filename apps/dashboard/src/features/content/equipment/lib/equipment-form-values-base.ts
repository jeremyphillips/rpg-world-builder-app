import type { Equipment, EquipmentKind } from '@rpg/contracts'

import type { weightFromForm } from '../../lib/forms/fields/content-economy-form-fields'
import { slugForInputParse } from '../../lib/forms/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/content-form-registry'

import type { EquipmentFormValues, EquipmentFormValuesFor } from './equipment-form-fields'

export type EquipmentInputBuildCtx<K extends EquipmentKind = EquipmentKind> = {
  values: EquipmentFormValuesFor<K>
  ctx?: ContentFormInputCtx<Equipment>
  weight: ReturnType<typeof weightFromForm>
}

/** Shared identity/cost fields for all equipment kind input builders. */
export function equipmentInputBase(
  values: Pick<EquipmentFormValues, 'name' | 'cost' | 'description'>,
  ctx?: ContentFormInputCtx<Equipment>,
): Pick<EquipmentFormValues, 'name' | 'cost'> & { description?: string; slug: string } {
  return {
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    cost: values.cost,
  }
}
