import { useCallback, useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { resolveMonsterLanguageAddFieldVocabulary } from './monster-language-add-field-options.lib'
import { buildMonsterLanguageFieldRecommendation } from './monster-language-field-recommendation.lib'
import type { MonsterFormValues } from './monster-form-values'

export function useMonsterLanguageAddField(ctx: ContentFormCtx) {
  const form = useFormContext<MonsterFormValues>()
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const creatureType = values?.creatureType
  const languageEntries = values?.proficiencies?.languages ?? []

  const selected = useMemo(
    () => new Set(languageEntries.map((entry) => entry.language)),
    [languageEntries],
  )

  const { languageOptions, affinityIds, creatureTypeLabel } = useMemo(
    () => resolveMonsterLanguageAddFieldVocabulary(ctx, creatureType, selected),
    [ctx, creatureType, selected],
  )

  const [addLanguageKey, setAddLanguageKey] = useState(0)

  const appendMonsterLanguage = useCallback(
    (languageId: string) => {
      if (!values?.proficiencies) return
      if (values.proficiencies.languages?.some((entry) => entry.language === languageId)) return
      form.setValue(
        'proficiencies.languages',
        [{ language: languageId }, ...(values.proficiencies.languages ?? [])],
        { shouldDirty: true },
      )
      setAddLanguageKey((key) => key + 1)
    },
    [form, values],
  )

  const recommendation = useMemo(
    () =>
      buildMonsterLanguageFieldRecommendation({
        affinityLanguageIds: affinityIds,
        selectableLanguageIds: languageOptions.map((option) => option.value),
        selectedLanguageIds: [...selected],
        languageLabelById: ctx.languageVocabulary?.labelById ?? {},
        creatureTypeLabel,
        onAddLanguage: appendMonsterLanguage,
      }),
    [
      affinityIds,
      appendMonsterLanguage,
      creatureTypeLabel,
      ctx.languageVocabulary?.labelById,
      languageOptions,
      selected,
    ],
  )

  return {
    proficienciesReady: Boolean(values?.proficiencies),
    languageOptions,
    addLanguageKey,
    appendMonsterLanguage,
    recommendation,
  }
}
