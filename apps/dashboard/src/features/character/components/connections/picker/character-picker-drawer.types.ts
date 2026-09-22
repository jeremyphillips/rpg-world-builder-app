import type { CharacterPickerOption } from '../../../lib/picker/character-picker-option.lib'

export const CHARACTER_PICKER_TITLE = 'Add person'
export const CHARACTER_PICKER_NO_RESULTS_MESSAGE = 'No characters match your search.'
export const CHARACTER_PICKER_NO_ITEMS_MESSAGE = 'No campaign characters are available.'

export type CharacterPickerItem = {
  character: CharacterPickerOption
  selected: boolean
  disabled?: boolean
}

export type CharacterPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  items: readonly CharacterPickerItem[]
  onSelect: (characterId: string) => void | Promise<void>
  /** When false, the picker stays open until the parent closes it — for multi-step add flows. */
  closeOnSelect?: boolean
}
