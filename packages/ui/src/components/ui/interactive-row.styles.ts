export const UI_INTERACTIVE_ROW_BLOCK_CLASS = 'ui-interactive-row' as const

export const UI_INTERACTIVE_ROW_HOVER_CLASS = {
  none: 'ui-interactive-row--hover-none',
  selectable: 'ui-interactive-row--hover-selectable',
  navigation: 'ui-interactive-row--hover-navigation',
  selected: 'ui-interactive-row--hover-selected',
  surface: 'ui-interactive-row--hover-surface',
  /** Listbox / picker rows (`InteractiveListRow`) — unselected pointer hover. */
  list: 'ui-interactive-row--hover-list',
} as const

export const UI_INTERACTIVE_ROW_SELECTED_CLASS = {
  none: 'ui-interactive-row--selected-none',
  fill: 'ui-interactive-row--selected-fill',
  bordered: 'ui-interactive-row--selected-bordered',
} as const

export const UI_INTERACTIVE_ROW_STATE_CLASS = {
  default: 'ui-interactive-row--state-default',
  inactive: 'ui-interactive-row--state-inactive',
  disabled: 'ui-interactive-row--state-disabled',
} as const

export const UI_INTERACTIVE_ROW_DATA_CLASS = {
  none: 'ui-interactive-row--data-none',
  selected: 'ui-interactive-row--data-selected',
  checked: 'ui-interactive-row--data-checked',
} as const

export const UI_INTERACTIVE_ROW_HIT_CLASS = {
  none: 'ui-interactive-row--hit-none',
  pointer: 'ui-interactive-row--hit-pointer',
} as const

export const UI_INTERACTIVE_ROW_HIGHLIGHT_CLASS = 'ui-interactive-row--highlight' as const

/** Keyboard / pointer active option — unselected list row. */
export const UI_INTERACTIVE_ROW_LIST_HIGHLIGHT_UNSELECTED_CLASS =
  'ui-interactive-row--highlight-list' as const

/** Keyboard / pointer active option — selected list row (strong wash). */
export const UI_INTERACTIVE_ROW_LIST_HIGHLIGHT_SELECTED_CLASS =
  'ui-interactive-row--highlight-list-selected' as const
export const UI_INTERACTIVE_ROW_RAIL_CLASS = 'ui-interactive-row--rail' as const
export const UI_INTERACTIVE_ROW_MENU_HIGHLIGHT_CLASS = 'ui-interactive-row--menu-highlight' as const
export const UI_INTERACTIVE_ROW_MENU_RAIL_CLASS = 'ui-interactive-row--menu-rail' as const
export const UI_INTERACTIVE_ROW_MENU_RESET_CLASS = 'ui-interactive-row--menu-reset' as const
export const UI_INTERACTIVE_ROW_FILL_SURFACE_CLASS = 'ui-interactive-row--fill-surface' as const

export type InteractiveRowClassSpec = {
  key: string
  className: string
  keyValues: string
  useCase: string
}

/** twMerge group — row hover modifiers. */
export const UI_INTERACTIVE_ROW_HOVER_CLASSES = Object.values(
  UI_INTERACTIVE_ROW_HOVER_CLASS,
) as readonly string[]

/** twMerge group — row selection fill modifiers. */
export const UI_INTERACTIVE_ROW_SELECTED_CLASSES = [
  ...Object.values(UI_INTERACTIVE_ROW_SELECTED_CLASS),
  UI_INTERACTIVE_ROW_FILL_SURFACE_CLASS,
] as readonly string[]

export const INTERACTIVE_ROW_CLASS_SPECS: readonly InteractiveRowClassSpec[] = [
  {
    key: 'hover-selectable',
    className: UI_INTERACTIVE_ROW_HOVER_CLASS.selectable,
    keyValues: '--ui-row-bg-hover: --row-hover-bg',
    useCase: 'Editor and selection rows',
  },
  {
    key: 'hover-navigation',
    className: UI_INTERACTIVE_ROW_HOVER_CLASS.navigation,
    keyValues: '--ui-row-bg-hover: --muted',
    useCase: 'Destination and link rows',
  },
  {
    key: 'selected-bordered',
    className: UI_INTERACTIVE_ROW_SELECTED_CLASS.bordered,
    keyValues: '--ui-row-bg + --ui-row-border',
    useCase: 'Bordered selection',
  },
  {
    key: 'state-disabled',
    className: UI_INTERACTIVE_ROW_STATE_CLASS.disabled,
    keyValues: 'opacity 0.5, no pointer events',
    useCase: 'Disabled row',
  },
]
