import type { Equipment, EquipmentCost, EquipmentKind } from '@rpg/contracts'

import { costFromForm, type EquipmentCostFormValue } from './equipment-economy-form-values'
import { slugForInputParse } from '../../lib/forms/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/content-form-registry'
import type { weightFromForm } from '../../lib/forms/fields/content-economy-form-fields'

import type { EquipmentFormValues, EquipmentFormValuesFor } from './equipment-form-fields'

export type EquipmentInputBuildCtx<K extends EquipmentKind = EquipmentKind> = {
  values: EquipmentFormValuesFor<K>
  ctx?: ContentFormInputCtx<Equipment>
  weight: ReturnType<typeof weightFromForm>
}

/** Shared identity/cost fields for all equipment kind input builders. */
export function equipmentInputBase(
  values: Pick<EquipmentFormValues, 'name' | 'hasMarketPrice' | 'cost' | 'description'>,
  ctx?: ContentFormInputCtx<Equipment>,
): Pick<EquipmentFormValues, 'name'> & { description?: string; slug: string; cost: EquipmentCost } {
  return {
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    cost: costFromForm(values.hasMarketPrice, values.cost as EquipmentCostFormValue | undefined),
  }
}
