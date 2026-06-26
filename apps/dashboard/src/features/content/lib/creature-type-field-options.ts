import { CREATURE_TYPE_ENTRIES, type CreatureType } from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

import type { ContentFormCtx } from './content-form-registry'
import { campaignRulesFromCtx } from './level-field-options'

const creatureTypeLabels = Object.fromEntries(
  Object.entries(CREATURE_TYPE_ENTRIES).map(([id, entry]) => [id, entry.label]),
) as Record<CreatureType, string>

/** Select options for species creature type — filtered to campaign-allowed character types. */
export function getCharacterCreatureTypeFieldOptions(ctx?: ContentFormCtx): FieldOption[] {
  const allowed = campaignRulesFromCtx(ctx).allowedCharacterCreatureTypes
  return toOptions([...allowed], creatureTypeLabels)
}

export function allowedCharacterCreatureTypesFromCtx(
  ctx?: ContentFormCtx,
): readonly CreatureType[] {
  return campaignRulesFromCtx(ctx).allowedCharacterCreatureTypes
}
