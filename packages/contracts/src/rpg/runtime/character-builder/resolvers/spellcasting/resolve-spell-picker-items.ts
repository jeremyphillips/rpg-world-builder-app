import type { Spell } from '../../../../content/spell'
import type { CharacterBuildContext } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import {
  PICKER_DISABLED_REASON_SELECTION_FULL,
  type PickerItemStateBase,
} from '../picker/picker-item-state'
import { resolveAvailableChoices } from '../registry/resolve-choices'
import {
  buildSpellPickerCompactSummary,
  buildSpellPickerSearchText,
} from './format-spell-picker-metadata'

export type SpellPickerItemState = PickerItemStateBase & {
  isAlreadySelected: boolean
  isSelectionFull: boolean
  canSelect: boolean
}

export type SpellPickerItem = {
  spell: Spell
  state: SpellPickerItemState
  searchText: string
  compactSummary: ReturnType<typeof buildSpellPickerCompactSummary>
}

export type ResolveSpellPickerItemsArgs = {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  choiceSetId: string
}

function resolveSpellPickerItemState(
  spellId: string,
  selectedIds: readonly string[],
  choiceSetMax: number,
): SpellPickerItemState {
  const isAlreadySelected = selectedIds.includes(spellId)
  const isSelectionFull = selectedIds.length >= choiceSetMax
  const disabledReasons: string[] = []

  if (!isAlreadySelected && isSelectionFull) {
    disabledReasons.push(PICKER_DISABLED_REASON_SELECTION_FULL)
  }

  return {
    isAvailable: true,
    isRecommended: false,
    isAlreadySelected,
    isSelectionFull,
    canSelect: !isAlreadySelected && !isSelectionFull,
    disabledReasons,
  }
}

/**
 * Enriches a spell ChoiceSet's options into picker-ready rows for the spell drawer.
 * Only options present on the ChoiceSet are returned (off-list spells are filtered upstream).
 */
export function resolveSpellPickerItems({
  draft,
  context,
  choiceSetId,
}: ResolveSpellPickerItemsArgs): SpellPickerItem[] {
  const choiceSet = resolveAvailableChoices(draft, context).find(
    (entry) => entry.id === choiceSetId,
  )
  if (!choiceSet) return []

  const selectedIds = draft.choiceSelections[choiceSetId] ?? []
  const spellsById = new Map(context.catalog.spells.map((spell) => [spell.id, spell]))

  return choiceSet.options.flatMap((option) => {
    const spell = spellsById.get(option.id)
    if (!spell) return []

    return [
      {
        spell,
        state: resolveSpellPickerItemState(spell.id, selectedIds, choiceSet.max),
        searchText: buildSpellPickerSearchText(spell),
        compactSummary: buildSpellPickerCompactSummary(spell),
      },
    ]
  })
}
