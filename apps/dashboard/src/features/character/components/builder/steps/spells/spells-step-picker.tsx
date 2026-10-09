import { useMemo } from 'react'

import {
  resolveSpellPickerItems,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type ChoiceSet,
} from '@rpg/contracts'

import { withChoiceSetSelections } from '../../../../lib/choice-sets/choice-set-selections'
import { enrichSpellPickerItems } from '../../../../lib/spells/spell-picker-search.lib'
import { SpellPickerDrawer } from '../../../spells/picker/spell-picker-drawer'
import {
  SPELL_PICKER_MODE_CANTRIPS,
  SPELL_PICKER_MODE_SPELLS,
  type SpellPickerMode,
} from '../../../spells/picker/spell-picker-drawer.types'

function spellPickerModeForChoiceSet(choiceSet: ChoiceSet): SpellPickerMode {
  return choiceSet.choiceType === 'cantrip' ? SPELL_PICKER_MODE_CANTRIPS : SPELL_PICKER_MODE_SPELLS
}

export type SpellsStepPickerProps = {
  className: string
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  choiceSet: ChoiceSet
  initialSpellLevel?: number
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
  onClose: () => void
}

export function SpellsStepPicker({
  className,
  draft,
  context,
  choiceSet,
  initialSpellLevel,
  onDraftChange,
  onClose,
}: SpellsStepPickerProps) {
  const mode = spellPickerModeForChoiceSet(choiceSet)
  const items = useMemo(
    () =>
      enrichSpellPickerItems(
        resolveSpellPickerItems({
          draft,
          context,
          choiceSetId: choiceSet.id,
        }),
      ),
    [choiceSet.id, context, draft],
  )
  const selectedIds = draft.choiceSelections[choiceSet.id] ?? []
  const recommendationsEnabled = useMemo(
    () => items.some((item) => item.state.isRecommended),
    [items],
  )
  const cantripChoiceSet = mode === SPELL_PICKER_MODE_CANTRIPS ? choiceSet : undefined
  const spellChoiceSet = mode === SPELL_PICKER_MODE_SPELLS ? choiceSet : undefined

  return (
    <SpellPickerDrawer
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      characterClassName={className}
      cantripChoiceSet={cantripChoiceSet}
      spellChoiceSet={spellChoiceSet}
      cantripSelectedIds={mode === SPELL_PICKER_MODE_CANTRIPS ? selectedIds : []}
      spellSelectedIds={mode === SPELL_PICKER_MODE_SPELLS ? selectedIds : []}
      cantripItems={mode === SPELL_PICKER_MODE_CANTRIPS ? items : []}
      spellItems={mode === SPELL_PICKER_MODE_SPELLS ? items : []}
      initialMode={mode}
      initialSpellLevel={initialSpellLevel}
      recommendationsEnabled={recommendationsEnabled}
      onSelectSpell={(_, spellId) => {
        if (selectedIds.includes(spellId)) return
        onDraftChange({
          choiceSelections: withChoiceSetSelections(draft, choiceSet.id, [...selectedIds, spellId]),
        })
      }}
      onRemoveSpell={(_, spellId) => {
        onDraftChange({
          choiceSelections: withChoiceSetSelections(
            draft,
            choiceSet.id,
            selectedIds.filter((id) => id !== spellId),
          ),
        })
      }}
    />
  )
}
