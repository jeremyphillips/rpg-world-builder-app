export type SortMenuOption<T extends string = string> = {
  value: T
  /** Full menu row copy. */
  label: string
  /** Short trigger copy — required; width ghosts reserve every distinct value. */
  triggerLabel: string
}

export type SortMenuSection<T extends string = string> =
  | { type: 'ungrouped'; options: readonly SortMenuOption<T>[] }
  | { type: 'group'; heading: string; options: readonly SortMenuOption<T>[] }

export type SortMenuProps<T extends string = string> = {
  value: T
  sections: readonly SortMenuSection<T>[]
  onValueChange: (value: T) => void
  /** Accessible context for the trigger; default `Sort by`. Current selection is appended. */
  label?: string
  variant?: 'ghost' | 'outline'
  size?: 'default' | 'sm'
  density?: 'default' | 'compact'
  disabled?: boolean
  className?: string
}
