'use client'

import { useMemo, useState } from 'react'

import {
  buildCharacterPreview,
  indexCharacterBuildCatalog,
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

  const openChoiceSet = (choiceSetId: string) => {
    setOpenChoiceSetId(choiceSetId)
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
    openChoiceSetId,
    setOpenChoiceSetId,
    openChoiceSet,
    removeChoiceSelection,
    onDraftChange,
  }
}
