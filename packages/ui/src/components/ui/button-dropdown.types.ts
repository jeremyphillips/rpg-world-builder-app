import type { ReactNode } from 'react'

import type { ButtonVariantProps } from './button.variants'
import type { PickerSearchOptions } from '../../lib/picker-search.types'

export type { PickerSearchOptions } from '../../lib/picker-search.types'

export type ButtonDropdownWidth = 'full' | 'fit'

export type ButtonDropdownItem = {
  id: string
  label: string
  metadata?: string
  groupId?: string
  searchTerms?: readonly string[]
  aliases?: readonly string[]
  search?: PickerSearchOptions
  disabled?: boolean
  note?: string
}

export type ButtonDropdownGroup = {
  id: string
  label: string
}

export type ButtonDropdownProps = {
  /** Trigger label — also used for listbox aria labels. */
  label: string
  /** Open-panel search placeholder; defaults to `Search {plural}…` from the trigger label. */
  searchPlaceholder?: string
  groups: ButtonDropdownGroup[]
  items: ButtonDropdownItem[]
  enableSearch?: boolean
  emptyMessage?: string
  onSelectItem: (id: string) => void
  variant?: ButtonVariantProps['variant']
  size?: ButtonVariantProps['size']
  /** Optional icon before the trigger label — callers supply add semantics explicitly. */
  leadingIcon?: ReactNode
  /** Trigger width — `fit` sizes to content; defaults to `full` (no width override). */
  width?: ButtonDropdownWidth
  className?: string
}
