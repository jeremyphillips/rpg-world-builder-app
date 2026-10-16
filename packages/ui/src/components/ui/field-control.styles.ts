export const UI_FIELD_CONTROL_BLOCK_CLASS = 'ui-field-control' as const

export const UI_FIELD_CONTROL_TRIGGER_CLASS = 'ui-field-control--trigger' as const

export const UI_FIELD_CONTROL_TRIGGER_FILL_CLASS = 'ui-field-control--trigger-fill' as const
export const UI_FIELD_CONTROL_TRIGGER_FIT_CLASS = 'ui-field-control--trigger-fit' as const
export const UI_FIELD_CONTROL_TRIGGER_SEGMENT_CLASS = 'ui-field-control--trigger-segment' as const

export const UI_FIELD_CONTROL_TRIGGER_FLOW_CLASSES = [
  UI_FIELD_CONTROL_TRIGGER_FILL_CLASS,
  UI_FIELD_CONTROL_TRIGGER_FIT_CLASS,
  UI_FIELD_CONTROL_TRIGGER_SEGMENT_CLASS,
] as const

export type FieldControlWidthKey =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | 'auto'
  | 'full'
  | '1/2'
  | '1/3'
  | '2/3'
  | '1/4'
  | '3/4'

const FIELD_CONTROL_WIDTH_CLASS: Record<FieldControlWidthKey, string> = {
  xs: 'ui-field-control--width-xs',
  sm: 'ui-field-control--width-sm',
  md: 'ui-field-control--width-md',
  lg: 'ui-field-control--width-lg',
  xl: 'ui-field-control--width-xl',
  auto: 'ui-field-control--width-auto',
  full: 'ui-field-control--width-full',
  '1/2': 'ui-field-control--width-1/2',
  '1/3': 'ui-field-control--width-1/3',
  '2/3': 'ui-field-control--width-2/3',
  '1/4': 'ui-field-control--width-1/4',
  '3/4': 'ui-field-control--width-3/4',
}

export const UI_FIELD_CONTROL_WIDTH_CLASSES = Object.values(FIELD_CONTROL_WIDTH_CLASS)

export function resolveFieldControlWidthClass(width: FieldControlWidthKey): string {
  return FIELD_CONTROL_WIDTH_CLASS[width]
}

export type FieldControlSizeKey = 'xs' | 'sm' | 'md' | 'lg'

export type FieldControlSizeSpec = {
  size: FieldControlSizeKey
  className: string
  controlHeight: string
  useCase: string
}

export const FIELD_CONTROL_SIZE_SPECS: readonly FieldControlSizeSpec[] = [
  {
    size: 'xs',
    className: 'ui-field-control--xs',
    controlHeight: '24px',
    useCase: 'Entity-card utility band and inline dense controls',
  },
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
    size: 'xs',
    className: 'ui-field-control--digits-xs',
    trailingReserve: '20px',
    useCase: 'Digit fields at xs control scale',
  },
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

export const UI_SEARCH_BAR_CLASS = 'ui-search-bar' as const
export const UI_SEARCH_BAR_EMBEDDED_HOST_CLASS = 'ui-search-bar--embedded-host' as const
export const UI_SEARCH_BAR_EMBEDDED_INPUT_WRAP_CLASS = 'ui-search-bar__embedded-wrap' as const
const UI_SEARCH_BAR_LEADING_ICON_CLASS = 'ui-search-bar__leading-icon' as const
export const UI_SEARCH_BAR_EMBEDDED_LEADING_ICON_CLASS = 'ui-search-bar__embedded-icon' as const
const UI_SEARCH_BAR_FIELD_INPUT_CLASS = 'ui-search-bar__field-input' as const
const UI_SEARCH_BAR_EMBEDDED_INPUT_CLASS = 'ui-search-bar__embedded-input' as const

const FIELD_CONTROL_SIZE_CLASS: Record<FieldControlSizeKey, string> = {
  xs: 'ui-field-control--xs',
  sm: 'ui-field-control--sm',
  md: 'ui-field-control--md',
  lg: 'ui-field-control--lg',
}

const FIELD_CONTROL_MULTILINE_SIZE_CLASS: Record<FieldControlSizeKey, string> = {
  xs: 'ui-field-control--multiline-sm',
  sm: 'ui-field-control--multiline-sm',
  md: 'ui-field-control--multiline-md',
  lg: 'ui-field-control--multiline-lg',
}

const FIELD_CONTROL_DIGITS_SIZE_CLASS: Record<FieldControlSizeKey, string> = {
  xs: 'ui-field-control--digits-xs',
  sm: 'ui-field-control--digits-sm',
  md: 'ui-field-control--digits-md',
  lg: 'ui-field-control--digits-lg',
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

/** twMerge groups — derived from field control size specs. */
export const UI_FIELD_CONTROL_SIZE_CLASSES = FIELD_CONTROL_SIZE_SPECS.map(
  (spec) => spec.className,
) as readonly string[]

export const UI_FIELD_CONTROL_MULTILINE_SIZE_CLASSES = FIELD_CONTROL_MULTILINE_SIZE_SPECS.map(
  (spec) => spec.className,
) as readonly string[]

export const UI_FIELD_CONTROL_DIGITS_SIZE_CLASSES = FIELD_CONTROL_DIGITS_SIZE_SPECS.map(
  (spec) => spec.className,
) as readonly string[]
