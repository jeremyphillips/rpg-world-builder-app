import type { ButtonVariantProps } from './button.variants'
import type { WeightedSearchField } from '../../lib/search'

export type ButtonDropdownItem = {
  id: string
  label: string
  description?: string
  groupId?: string
  searchTerms?: WeightedSearchField[]
  disabled?: boolean
  note?: string
}

export type ButtonDropdownGroup = {
  id: string
  label: string
}

export type ButtonDropdownProps = {
  /** Trigger label — also used for search-field and listbox aria labels. */
  label: string
  groups: ButtonDropdownGroup[]
  items: ButtonDropdownItem[]
  enableSearch?: boolean
  emptyMessage?: string
  onSelectItem: (id: string) => void
  variant?: ButtonVariantProps['variant']
  size?: ButtonVariantProps['size']
  className?: string
}
