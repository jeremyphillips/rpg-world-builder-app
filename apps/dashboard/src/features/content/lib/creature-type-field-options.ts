import { CREATURE_TYPE_ENTRIES, type CreatureTypeId } from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

import type { ContentFormCtx } from './content-form-registry'
import { campaignRulesFromCtx } from './level-field-options'

const creatureTypeLabels: Record<string, string> = Object.fromEntries(
  Object.entries(CREATURE_TYPE_ENTRIES).map(([id, entry]) => [id, entry.label]),
)

/** Select options for species creature type — filtered to campaign-allowed character types. */
export function getCharacterCreatureTypeFieldOptions(ctx?: ContentFormCtx): FieldOption[] {
  const allowed = campaignRulesFromCtx(ctx).allowedCharacterCreatureTypes
  return toOptions([...allowed], creatureTypeLabels)
}

export function allowedCharacterCreatureTypesFromCtx(
  ctx?: ContentFormCtx,
): readonly CreatureTypeId[] {
  return campaignRulesFromCtx(ctx).allowedCharacterCreatureTypes
}
