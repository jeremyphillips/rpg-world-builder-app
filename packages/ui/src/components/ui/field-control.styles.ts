export const UI_FIELD_CONTROL_BLOCK_CLASS = 'ui-field-control' as const

export const UI_FIELD_CONTROL_TRIGGER_CLASS = 'ui-field-control--trigger' as const

export const UI_FIELD_CONTROL_GROUPED_SHELL_CLASS = 'ui-field-control-shell--grouped' as const

export const UI_FIELD_CONTROL_GROUPED_SHELL_INVALID_CLASS =
  'ui-field-control-shell--grouped-invalid' as const

export type FieldControlSizeKey = 'sm' | 'md' | 'lg'

export type FieldControlSizeSpec = {
  size: FieldControlSizeKey
  className: string
  controlHeight: string
  useCase: string
}

export const FIELD_CONTROL_SIZE_SPECS: readonly FieldControlSizeSpec[] = [
  {
    size: 'sm',
    className: 'ui-field-control--sm',
    controlHeight: '32px',
    useCase: 'Compact filters and dense forms',
  },
  {
    size: 'md',
    className: 'ui-field-control--md',
    controlHeight: '36px',
    useCase: 'Default comfortable single-line controls',
  },
  {
    size: 'lg',
    className: 'ui-field-control--lg',
    controlHeight: '44px',
    useCase: 'Emphasis fields and controlSizeOverride lg',
  },
] as const

export type FieldControlMultilineSizeSpec = {
  size: FieldControlSizeKey
  className: string
  minHeight: string
  useCase: string
}

export const FIELD_CONTROL_MULTILINE_SIZE_SPECS: readonly FieldControlMultilineSizeSpec[] = [
  {
    size: 'sm',
    className: 'ui-field-control--multiline-sm',
    minHeight: '4rem',
    useCase: 'Compact multi-line notes',
  },
  {
    size: 'md',
    className: 'ui-field-control--multiline-md',
    minHeight: '5rem',
    useCase: 'Default textarea height',
  },
  {
    size: 'lg',
    className: 'ui-field-control--multiline-lg',
    minHeight: '7rem',
    useCase: 'Large multi-line authoring',
  },
] as const

export type FieldControlDigitsSizeSpec = {
  size: FieldControlSizeKey
  className: string
  trailingReserve: string
  useCase: string
}

export const FIELD_CONTROL_DIGITS_SIZE_SPECS: readonly FieldControlDigitsSizeSpec[] = [
  {
    size: 'sm',
    className: 'ui-field-control--digits-sm',
    trailingReserve: '24px',
    useCase: 'Digit fields with sm stepper column',
  },
  {
    size: 'md',
    className: 'ui-field-control--digits-md',
    trailingReserve: '24px',
    useCase: 'Default digit fields and number inputs',
  },
  {
    size: 'lg',
    className: 'ui-field-control--digits-lg',
    trailingReserve: '32px',
    useCase: 'Large digit fields with wider stepper column',
  },
] as const

export type FilterInlineAppearanceKey = 'outline' | 'ghost'

export type FilterInlineAppearanceSpec = {
  appearance: FilterInlineAppearanceKey
  className: string
  useCase: string
}

export const FILTER_INLINE_APPEARANCE_SPECS: readonly FilterInlineAppearanceSpec[] = [
  {
    appearance: 'outline',
    className: 'ui-field-control--filter-outline',
    useCase: 'Default bordered boolean filter shell',
  },
  {
    appearance: 'ghost',
    className: 'ui-field-control--filter-ghost',
    useCase: 'Toolbar boolean filters without border',
  },
] as const

export const UI_FILTER_INLINE_SHELL_CLASS = 'ui-field-control--filter-inline' as const

export const UI_SEARCH_BAR_CLASS = 'ui-search-bar' as const
export const UI_SEARCH_BAR_EMBEDDED_HOST_CLASS = 'ui-search-bar--embedded-host' as const
export const UI_SEARCH_BAR_EMBEDDED_INPUT_WRAP_CLASS = 'ui-search-bar__embedded-wrap' as const
export const UI_SEARCH_BAR_LEADING_ICON_CLASS = 'ui-search-bar__leading-icon' as const
export const UI_SEARCH_BAR_EMBEDDED_LEADING_ICON_CLASS = 'ui-search-bar__embedded-icon' as const
export const UI_SEARCH_BAR_FIELD_INPUT_CLASS = 'ui-search-bar__field-input' as const
export const UI_SEARCH_BAR_EMBEDDED_INPUT_CLASS = 'ui-search-bar__embedded-input' as const

const FIELD_CONTROL_SIZE_CLASS: Record<FieldControlSizeKey, string> = {
  sm: 'ui-field-control--sm',
  md: 'ui-field-control--md',
  lg: 'ui-field-control--lg',
}

const FIELD_CONTROL_MULTILINE_SIZE_CLASS: Record<FieldControlSizeKey, string> = {
  sm: 'ui-field-control--multiline-sm',
  md: 'ui-field-control--multiline-md',
  lg: 'ui-field-control--multiline-lg',
}

const FIELD_CONTROL_DIGITS_SIZE_CLASS: Record<FieldControlSizeKey, string> = {
  sm: 'ui-field-control--digits-sm',
  md: 'ui-field-control--digits-md',
  lg: 'ui-field-control--digits-lg',
}

const FILTER_INLINE_APPEARANCE_CLASS: Record<FilterInlineAppearanceKey, string> = {
  outline: 'ui-field-control--filter-outline',
  ghost: 'ui-field-control--filter-ghost',
}

export function resolveFieldControlSizeClass(size: FieldControlSizeKey = 'md'): string {
  return FIELD_CONTROL_SIZE_CLASS[size]
}

export function resolveFieldControlMultilineSizeClass(size: FieldControlSizeKey = 'md'): string {
  return FIELD_CONTROL_MULTILINE_SIZE_CLASS[size]
}

export function resolveFieldControlDigitsSizeClass(size: FieldControlSizeKey = 'md'): string {
  return FIELD_CONTROL_DIGITS_SIZE_CLASS[size]
}

export function resolveFieldControlTriggerClasses(size: FieldControlSizeKey = 'md'): string {
  return `${UI_FIELD_CONTROL_BLOCK_CLASS} ${UI_FIELD_CONTROL_TRIGGER_CLASS} ${resolveFieldControlSizeClass(size)}`
}

export function resolveFilterInlineAppearanceClass(
  appearance: FilterInlineAppearanceKey = 'outline',
): string {
  return FILTER_INLINE_APPEARANCE_CLASS[appearance]
}

export function resolveSearchBarLeadingIconClass(size: FieldControlSizeKey = 'md'): string {
  return `${UI_SEARCH_BAR_LEADING_ICON_CLASS} ui-search-bar__leading-icon--${size}`
}

export function resolveSearchBarFieldInputClass(
  size: FieldControlSizeKey = 'md',
  options: { clearable?: boolean } = {},
): string {
  const clearable = options.clearable ? ' ui-search-bar__field-input--clearable' : ''
  return `${UI_SEARCH_BAR_FIELD_INPUT_CLASS} ui-search-bar__field-input--${size}${clearable}`
}

export function resolveSearchBarEmbeddedInputClass(
  size: FieldControlSizeKey = 'md',
  options: { clearable?: boolean } = {},
): string {
  const clearable = options.clearable ? ' ui-search-bar__embedded-input--clearable' : ''
  return `${UI_SEARCH_BAR_EMBEDDED_INPUT_CLASS} ui-search-bar__embedded-input--${size}${clearable}`
}
