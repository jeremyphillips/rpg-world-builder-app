import { type CreateEquipmentInput, type ToolEquipment } from '@rpg/contracts'

import {
  equipmentInputBase,
  parseEquipmentCreateInput,
  type EquipmentInputBuildCtx,
} from '../../lib/equipment-form-values-base'
import { parseNewlineList } from '../../lib/parse-newline-list'
import type { ToolEquipmentFormValues } from '../../lib/equipment-form-fields'

/** Joins craft item lines for the unified equipment form textarea. */
export function formatCraftsText(items: string[] | undefined): string | undefined {
  return items?.length ? items.join('\n') : undefined
}

export function toolFormValuesFromEntity(
  item: ToolEquipment,
): Pick<ToolEquipmentFormValues, 'toolCategory' | 'ability' | 'utilizes' | 'craftsText'> {
  return {
    toolCategory: item.toolCategory,
    ability: item.ability,
    utilizes: item.utilizes,
    craftsText: formatCraftsText(item.crafts),
  }
}

/** Maps tool form values to a create/update API input fragment. */
export function buildToolInput({
  values,
  ctx,
  weight,
  validationIntent = 'publish',
}: EquipmentInputBuildCtx<'tool'>): CreateEquipmentInput {
  const crafts = parseNewlineList(values.craftsText)
  const isDraft = validationIntent === 'draft'

  return parseEquipmentCreateInput(
    {
      ...equipmentInputBase(values, ctx, validationIntent),
      kind: 'tool',
      ...(values.toolCategory
        ? { toolCategory: values.toolCategory }
        : isDraft
          ? {}
          : { toolCategory: 'other' as const }),
      ...(values.ability
        ? { ability: values.ability }
        : isDraft
          ? {}
          : { ability: 'int' as const }),
      ...(isDraft
        ? values.utilizes && { utilizes: values.utilizes }
        : { utilizes: values.utilizes ?? [] }),
      ...(weight && { weight }),
      ...(crafts && { crafts }),
    },
    validationIntent,
  )
}
