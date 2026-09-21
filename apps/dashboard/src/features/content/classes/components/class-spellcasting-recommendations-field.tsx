import { useCallback, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { ComboboxField, Text } from '@rpg/ui'
import type { SpellRecommendation } from '@rpg/contracts'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import type { ClassFormValues } from '../lib/class-form-fields'
import {
  readRecommendationSpellIds,
  spellOptionsForRecommendationTarget,
  SPELLCASTING_RECOMMENDATION_TARGET_LABELS,
  upsertRecommendationSpellIds,
} from '../lib/class-spellcasting-recommendations-field.lib'

type ClassSpellcastingRecommendationsFieldProps = {
  formCtx: ContentFormCtx
}

export function ClassSpellcastingRecommendationsField({
  formCtx,
}: ClassSpellcastingRecommendationsFieldProps) {
  const { control, setValue } = useFormContext<ClassFormValues>()
  const recommendations = useWatch({
    control,
    name: 'spellcasting.recommendations',
  }) as SpellRecommendation[] | undefined

  const spellCatalog = formCtx.options?.spells?.forReference()
  const cantripOptions = useMemo(
    () => spellOptionsForRecommendationTarget(spellCatalog, 'cantrips'),
    [spellCatalog],
  )
  const level1Options = useMemo(
    () => spellOptionsForRecommendationTarget(spellCatalog, 'level1Plus'),
    [spellCatalog],
  )

  const cantripIds = readRecommendationSpellIds(recommendations, 'cantrips')
  const level1Ids = readRecommendationSpellIds(recommendations, 'level1Plus')

  const writeTarget = useCallback(
    (target: SpellRecommendation['target'], spellIds: string[]) => {
      setValue(
        'spellcasting.recommendations',
        upsertRecommendationSpellIds(recommendations, target, spellIds),
        { shouldDirty: true },
      )
    },
    [recommendations, setValue],
  )

  return (
    <div className="flex flex-col gap-4">
      <Text variant="muted" className="text-sm">
        Recommended starting spells appear as badges in the character builder spell picker. They do
        not grant spells or change quotas.
      </Text>
      <ComboboxField
        id="class-spellcasting-recommended-cantrips"
        label={SPELLCASTING_RECOMMENDATION_TARGET_LABELS.cantrips}
        hint="Suggested cantrips for new characters."
        options={cantripOptions}
        value={cantripIds}
        onChange={(next) => writeTarget('cantrips', Array.isArray(next) ? next : [])}
        multiple
        placeholder="Choose cantrips"
      />
      <ComboboxField
        id="class-spellcasting-recommended-level-1"
        label={SPELLCASTING_RECOMMENDATION_TARGET_LABELS.level1Plus}
        hint="Suggested level 1 spells for new characters."
        options={level1Options}
        value={level1Ids}
        onChange={(next) => writeTarget('level1Plus', Array.isArray(next) ? next : [])}
        multiple
        placeholder="Choose level 1 spells"
      />
    </div>
  )
}
