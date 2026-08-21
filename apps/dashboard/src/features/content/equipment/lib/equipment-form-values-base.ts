import {
  createEquipmentDraftInputSchema,
  createEquipmentInputSchema,
  type ContentValidationIntent,
  type CreateEquipmentInput,
  type Equipment,
  type EquipmentCost,
  type EquipmentKind,
} from '@rpg/contracts'

import { costFromForm, type EquipmentCostFormValue } from './equipment-economy-form-values'
import { slugForInputParse } from '../../lib/forms/registry/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/registry/content-form-registry'
import type { weightFromForm } from '../../lib/forms/fields/content-economy-form-fields'

import type { EquipmentFormValues, EquipmentFormValuesFor } from './equipment-form-fields'

export type EquipmentInputBuildCtx<K extends EquipmentKind = EquipmentKind> = {
  values: EquipmentFormValuesFor<K>
  ctx?: ContentFormInputCtx<Equipment>
  weight: ReturnType<typeof weightFromForm>
  validationIntent?: ContentValidationIntent
}

/** Parses create input with publish or draft contract schemas. */
export function parseEquipmentCreateInput(
  input: unknown,
  validationIntent: ContentValidationIntent = 'publish',
): CreateEquipmentInput {
  const schema =
    validationIntent === 'draft' ? createEquipmentDraftInputSchema : createEquipmentInputSchema
  return schema.parse(input) as CreateEquipmentInput
}

/** Shared identity/cost fields for all equipment kind input builders. */
export function equipmentInputBase(
  values: Pick<EquipmentFormValues, 'name' | 'hasMarketPrice' | 'cost' | 'description'>,
  ctx?: ContentFormInputCtx<Equipment>,
  validationIntent: ContentValidationIntent = 'publish',
): Pick<EquipmentFormValues, 'name'> & {
  description?: string
  slug: string
  cost?: EquipmentCost
} {
  const base = {
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
  }

  if (validationIntent === 'draft') {
    if (!values.hasMarketPrice) return { ...base, cost: null }
    const amount = values.cost?.amount
    if (amount === undefined || Number.isNaN(amount)) return base
    return {
      ...base,
      cost: { amount, currency: values.cost?.currency ?? 'gp' },
    }
  }

  return {
    ...base,
    cost: costFromForm(values.hasMarketPrice, values.cost as EquipmentCostFormValue | undefined),
  }
}
