import type { CharacterPickerOption } from '../../../lib/picker/character-picker-option.lib'

export const CHARACTER_PICKER_SEARCH_PLACEHOLDER = 'Search characters'

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
  /** Catalog class names. Falls back to the reference-id label when omitted. */
  resolveClassLabel?: (classId: string) => string
  onSelect: (characterId: string) => void | Promise<void>
  /** When false, the picker stays open until the parent closes it — for multi-step add flows. */
  closeOnSelect?: boolean
  /** Browse-row verb. Confirm Add stays on the parent footer. */
  rowActionLabel?: string
  bodyReplacement?: React.ReactNode
  footer?: React.ReactNode
}
