'use client'

import { useMemo, useState } from 'react'

import {
  buildCharacterPreview,
  indexCharacterBuildCatalog,
  resolveBuilderStepReadiness,
  resolveProficiencyPickerItems,
  resolveProficiencyStepModel,
} from '@rpg/contracts'

import { withChoiceSetSelections } from '../../lib/choice-set-selections'
import type { ProficienciesStepProps } from './proficiencies-step.types'

export function useProficienciesStep({
  context,
  draft,
  preview,
  resolvedChoiceSets,
  onDraftChange,
}: ProficienciesStepProps) {
  const [openChoiceSetId, setOpenChoiceSetId] = useState<string | null>(null)

  const effectivePreview = useMemo(() => {
    if (preview) return preview

    const catalogIndex = indexCharacterBuildCatalog(context.catalog)
    return buildCharacterPreview(
      draft,
      catalogIndex,
      context.characterCreationRules,
      context.rulesetId,
      { resolvedChoiceSets },
    )
  }, [context, draft, preview, resolvedChoiceSets])

  const catalogIndex = useMemo(() => indexCharacterBuildCatalog(context.catalog), [context.catalog])

  const model = useMemo(
    () =>
      resolveProficiencyStepModel({
        draft,
        context,
        preview: effectivePreview,
        choiceSets: resolvedChoiceSets,
      }),
    [context, draft, effectivePreview, resolvedChoiceSets],
  )

  const readiness = useMemo(
    () => resolveBuilderStepReadiness('proficiencies', draft, context, resolvedChoiceSets),
    [context, draft, resolvedChoiceSets],
  )

  const activeChoiceSet = useMemo(
    () => resolvedChoiceSets.find((choiceSet) => choiceSet.id === openChoiceSetId),
    [openChoiceSetId, resolvedChoiceSets],
  )

  const pickerItems = useMemo(() => {
    if (!activeChoiceSet) return []
    return resolveProficiencyPickerItems({
      draft,
      context,
      choiceSetId: activeChoiceSet.id,
      proficiencies: effectivePreview.proficiencies,
    })
  }, [activeChoiceSet, context, draft, effectivePreview.proficiencies])

  const openChoiceSet = (choiceSetId: string) => {
    setOpenChoiceSetId(choiceSetId)
  }

  const closeChoiceSet = () => {
    setOpenChoiceSetId(null)
  }

  const addChoiceSelection = (choiceSetId: string, optionId: string) => {
    const selections = draft.choiceSelections[choiceSetId] ?? []
    if (selections.includes(optionId)) return
    onDraftChange({
      choiceSelections: withChoiceSetSelections(draft, choiceSetId, [...selections, optionId]),
    })
  }

  const removeChoiceSelection = (choiceSetId: string, optionId: string) => {
    const selections = draft.choiceSelections[choiceSetId] ?? []
    onDraftChange({
      choiceSelections: withChoiceSetSelections(
        draft,
        choiceSetId,
        selections.filter((id) => id !== optionId),
      ),
    })
  }

  return {
    model,
    readiness,
    activeChoiceSet,
    pickerItems,
    catalogIndex,
    openChoiceSet,
    closeChoiceSet,
    addChoiceSelection,
    removeChoiceSelection,
    draft,
  }
}
