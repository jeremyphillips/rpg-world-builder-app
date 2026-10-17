import { getCreatureTypeLabel } from '@/features/vocabulary'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { prepareMonsterLanguageComboboxOptions } from './monster-language-combobox-options.lib'

export function resolveMonsterLanguageAddFieldVocabulary(
  ctx: ContentFormCtx,
  creatureType: string | undefined,
  selected: ReadonlySet<string>,
) {
  const creatureTypeLabel =
    creatureType && ctx.creatureTypeVocabulary
      ? getCreatureTypeLabel(ctx.creatureTypeVocabulary, creatureType)
      : undefined

  const affinityIds =
    creatureType && ctx.creatureTypeVocabulary
      ? (ctx.creatureTypeVocabulary.languageAffinitiesById[creatureType] ?? [])
      : []

  const baseOptions = [...(ctx.languageVocabulary?.activeIds ?? [])]
    .filter((id) => !selected.has(id))
    .map((id) => ({
      value: id,
      label: ctx.languageVocabulary?.labelById[id] ?? id,
    }))

  const languageOptions = prepareMonsterLanguageComboboxOptions({
    activeLanguageOptions: baseOptions,
    selectedLanguageIds: selected,
    affinityLanguageIds: affinityIds,
    creatureTypeLabel,
  })

  return { languageOptions, affinityIds, creatureTypeLabel }
}
