'use client'

import { useMemo } from 'react'

import {
  resolveSpellPickerItems,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type ChoiceSet,
} from '@rpg/contracts'

import { withChoiceSetSelections } from '../../../lib/choice-sets/choice-set-selections'
import { SpellPickerDrawer } from '../../spells/spell-picker-drawer.client'
import {
  SPELL_PICKER_MODE_CANTRIPS,
  SPELL_PICKER_MODE_PREPARED_SPELLS,
  type SpellPickerMode,
} from '../../spells/spell-picker-drawer.types'

function spellPickerModeForChoiceSet(choiceSet: ChoiceSet): SpellPickerMode {
  return choiceSet.choiceType === 'cantrip'
    ? SPELL_PICKER_MODE_CANTRIPS
    : SPELL_PICKER_MODE_PREPARED_SPELLS
}

function resolvePickerChoiceSet(
  mode: SpellPickerMode,
  cantripChoiceSet: ChoiceSet | undefined,
  preparedChoiceSet: ChoiceSet | undefined,
): ChoiceSet | undefined {
  return mode === SPELL_PICKER_MODE_CANTRIPS ? cantripChoiceSet : preparedChoiceSet
}

export type SpellsStepPickerProps = {
  className: string
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  cantripChoiceSet?: ChoiceSet
  preparedChoiceSet?: ChoiceSet
  initialMode: SpellPickerMode
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  onClose: () => void
}

export function SpellsStepPicker({
  className,
  draft,
  context,
  cantripChoiceSet,
  preparedChoiceSet,
  initialMode,
  onDraftChange,
  onClose,
}: SpellsStepPickerProps) {
  const cantripItems = useMemo(() => {
    if (!cantripChoiceSet) return []
    return resolveSpellPickerItems({
      draft,
      context,
      choiceSetId: cantripChoiceSet.id,
    })
  }, [cantripChoiceSet, context, draft])

  const preparedItems = useMemo(() => {
    if (!preparedChoiceSet) return []
    return resolveSpellPickerItems({
      draft,
      context,
      choiceSetId: preparedChoiceSet.id,
    })
  }, [context, draft, preparedChoiceSet])

  return (
    <SpellPickerDrawer
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      className={className}
      cantripChoiceSet={cantripChoiceSet}
      preparedChoiceSet={preparedChoiceSet}
      cantripSelectedIds={draft.choiceSelections[cantripChoiceSet?.id ?? ''] ?? []}
      preparedSelectedIds={draft.choiceSelections[preparedChoiceSet?.id ?? ''] ?? []}
      cantripItems={cantripItems}
      preparedItems={preparedItems}
      initialMode={initialMode}
      onSelectSpell={(mode, spellId) => {
        const choiceSet = resolvePickerChoiceSet(mode, cantripChoiceSet, preparedChoiceSet)
        if (!choiceSet) return
        const current = draft.choiceSelections[choiceSet.id] ?? []
        if (current.includes(spellId)) return
        onDraftChange({
          choiceSelections: withChoiceSetSelections(draft, choiceSet.id, [...current, spellId]),
        })
      }}
      onRemoveSpell={(mode, spellId) => {
        const choiceSet = resolvePickerChoiceSet(mode, cantripChoiceSet, preparedChoiceSet)
        if (!choiceSet) return
        const current = draft.choiceSelections[choiceSet.id] ?? []
        onDraftChange({
          choiceSelections: withChoiceSetSelections(
            draft,
            choiceSet.id,
            current.filter((id) => id !== spellId),
          ),
        })
      }}
    />
  )
}

export { spellPickerModeForChoiceSet }
