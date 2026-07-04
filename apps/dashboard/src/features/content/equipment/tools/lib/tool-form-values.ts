import {
  createEquipmentInputSchema,
  type CreateEquipmentInput,
  type ToolEquipment,
} from '@rpg/contracts'

import {
  equipmentInputBase,
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
}: EquipmentInputBuildCtx<'tool'>): CreateEquipmentInput {
  const crafts = parseNewlineList(values.craftsText)

  return createEquipmentInputSchema.parse({
    ...equipmentInputBase(values, ctx),
    kind: 'tool',
    toolCategory: values.toolCategory ?? 'other',
    ability: values.ability ?? 'int',
    utilizes: values.utilizes ?? [],
    ...(weight && { weight }),
    ...(crafts && { crafts }),
  })
}
