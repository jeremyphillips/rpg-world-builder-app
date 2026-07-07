import type { ChoiceSet, SpellPickerItem } from '@rpg/contracts'

export type { ChoiceSet, SpellPickerItem, SpellPickerItemState } from '@rpg/contracts'

export const SPELL_PICKER_NO_RESULTS_MESSAGE = 'No spells match your search.'
export const SPELL_PICKER_NO_OPTIONS_MESSAGE = 'No spells are available for this choice.'
export const SPELL_PICKER_SELECTION_FULL_MESSAGE =
  'You have selected the maximum number of spells for this choice.'

export type SpellPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  choiceSet: ChoiceSet
  selectedIds: string[]
  items: readonly SpellPickerItem[]
  onSelectSpell: (spellId: string) => void
  onRemoveSpell: (spellId: string) => void
}
