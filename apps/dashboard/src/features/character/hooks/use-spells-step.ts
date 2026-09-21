import { useMemo, useState } from 'react'

import {
  resolveBuilderStepReadiness,
  resolveSpellStepModel,
  resolveSpellcastingProfile,
} from '@rpg/contracts'

import { withChoiceSetSelections } from '../lib/choice-sets/choice-set-selections'
import { choiceSetsForSpellsStep } from '../lib/spells/spells-step.lib'
import type { SpellsStepProps } from '../components/builder/steps/spells/spells-step'

export function useSpellsStep({
  context,
  draft,
  preview,
  resolvedChoiceSets,
  onDraftChange,
}: SpellsStepProps) {
  const [openChoiceSetId, setOpenChoiceSetId] = useState<string | null>(null)
  const [pickerInitialSpellLevel, setPickerInitialSpellLevel] = useState<number | undefined>()
  const [activeSpellLevel, setActiveSpellLevel] = useState(1)

  const profile = useMemo(() => resolveSpellcastingProfile(draft, context), [context, draft])
  const choiceSets = useMemo(
    () => choiceSetsForSpellsStep(resolvedChoiceSets),
    [resolvedChoiceSets],
  )

  const model = useMemo(() => {
    if (!profile) return null
    return resolveSpellStepModel({
      draft,
      context,
      preview,
      profile,
      choiceSets: resolvedChoiceSets,
    })
  }, [choiceSets, context, draft, preview, profile, resolvedChoiceSets])

  const readiness = useMemo(
    () => resolveBuilderStepReadiness('spells', draft, context, resolvedChoiceSets),
    [context, draft, resolvedChoiceSets],
  )

  const activeChoiceSet = useMemo(
    () => resolvedChoiceSets.find((choiceSet) => choiceSet.id === openChoiceSetId),
    [openChoiceSetId, resolvedChoiceSets],
  )

  const openChoiceSet = (choiceSetId: string, initialSpellLevel?: number) => {
    setOpenChoiceSetId(choiceSetId)
    setPickerInitialSpellLevel(initialSpellLevel)
  }

  const closeChoiceSet = () => {
    setOpenChoiceSetId(null)
    setPickerInitialSpellLevel(undefined)
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
    profile,
    readiness,
    activeChoiceSet,
    pickerInitialSpellLevel,
    activeSpellLevel,
    setActiveSpellLevel,
    openChoiceSet,
    closeChoiceSet,
    addChoiceSelection,
    removeChoiceSelection,
    draft,
    context,
  }
}
