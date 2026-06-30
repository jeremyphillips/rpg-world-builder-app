import { type CreatureTypeId } from '@rpg/contracts'
import { toOptions, type FieldOption } from '@rpg/ui/form'

import {
  buildSeedCreatureTypeVocabulary,
  getCreatureTypeLabel as getVocabularyCreatureTypeLabel,
  type CreatureTypeVocabulary,
} from '@/features/homebrew'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { campaignRulesFromCtx } from '../../lib/form-options/level-field-options'

const seedCreatureTypeVocabulary = buildSeedCreatureTypeVocabulary()

function resolveCreatureTypeVocabulary(ctx?: ContentFormCtx): CreatureTypeVocabulary {
  return ctx?.creatureTypeVocabulary ?? seedCreatureTypeVocabulary
}

/** Select options for species creature type — filtered to campaign-allowed character types. */
export function getCharacterCreatureTypeFieldOptions(ctx?: ContentFormCtx): FieldOption[] {
  const vocabulary = resolveCreatureTypeVocabulary(ctx)
  const allowed = campaignRulesFromCtx(ctx).allowedCharacterCreatureTypes
  const activeAllowed = allowed.filter((id) => vocabulary.activeIds.has(id))
  return toOptions([...activeAllowed], vocabulary.labelById)
}

export function allowedCharacterCreatureTypesFromCtx(
  ctx?: ContentFormCtx,
): readonly CreatureTypeId[] {
  return campaignRulesFromCtx(ctx).allowedCharacterCreatureTypes
}

/** Campaign-aware creature type label; falls back to seed labels when vocabulary is absent. */
export function getCreatureTypeLabel(id: string, ctx?: ContentFormCtx): string {
  return getVocabularyCreatureTypeLabel(resolveCreatureTypeVocabulary(ctx), id)
}

export { seedCreatureTypeVocabulary }
