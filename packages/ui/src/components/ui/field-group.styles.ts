export type FieldGroupSizeKey = 'sm' | 'md' | 'lg'

export const UI_FIELD_GROUP_BLOCK_CLASS = 'ui-field-group' as const

export const UI_FIELD_GROUP_INVALID_CLASS = 'ui-field-group--invalid' as const

export const UI_FIELD_GROUP_STRETCH_LAYOUT_CLASS = 'ui-field-group--stretch' as const

export const UI_FIELD_GROUP_INTRINSIC_LAYOUT_CLASS = 'ui-field-group--intrinsic' as const

export const UI_FIELD_GROUP_FLOW_COL_LAYOUT_CLASS = 'ui-field-group--flow-col' as const

/** @deprecated Prefer {@link UI_FIELD_GROUP_BLOCK_CLASS}. */
export const UI_FIELD_CONTROL_GROUPED_SHELL_CLASS = UI_FIELD_GROUP_BLOCK_CLASS

/** @deprecated Prefer {@link UI_FIELD_GROUP_INVALID_CLASS}. */
export const UI_FIELD_CONTROL_GROUPED_SHELL_INVALID_CLASS = UI_FIELD_GROUP_INVALID_CLASS

export type FieldGroupSizeSpec = {
  size: FieldGroupSizeKey
  className: string
  controlHeight: string
  useCase: string
}

export const FIELD_GROUP_SIZE_SPECS: readonly FieldGroupSizeSpec[] = [
  {
    size: 'sm',
    className: 'ui-field-group--sm',
    controlHeight: '32px',
    useCase: 'Compact grouped controls (JoinedPair sm, InputActionGroup sm)',
  },
  {
    size: 'md',
    className: 'ui-field-group--md',
    controlHeight: '36px',
    useCase: 'Default grouped field composites',
  },
  {
    size: 'lg',
    className: 'ui-field-group--lg',
    controlHeight: '44px',
    useCase: 'Emphasis grouped controls',
  },
] as const

const FIELD_GROUP_SIZE_CLASS: Record<FieldGroupSizeKey, string> = {
  sm: 'ui-field-group--sm',
  md: 'ui-field-group--md',
  lg: 'ui-field-group--lg',
}

export function resolveFieldGroupSizeClass(size: FieldGroupSizeKey = 'md'): string {
  return FIELD_GROUP_SIZE_CLASS[size]
}

export function resolveFieldGroupLayoutClass(
  layout: 'stretch' | 'intrinsic' | 'flow-col' = 'intrinsic',
): string {
  if (layout === 'stretch') return UI_FIELD_GROUP_STRETCH_LAYOUT_CLASS
  if (layout === 'flow-col') return UI_FIELD_GROUP_FLOW_COL_LAYOUT_CLASS
  return UI_FIELD_GROUP_INTRINSIC_LAYOUT_CLASS
}

export const UI_FIELD_GROUP_DIVIDER_PRIMARY_CLASS = 'ui-field-group__divider--primary' as const

export const UI_FIELD_GROUP_DIVIDER_SUBTLE_CLASS = 'ui-field-group__divider--subtle' as const

export const UI_FIELD_GROUP_SEGMENT_CLASS = 'ui-field-group__segment' as const

export const UI_FIELD_GROUP_SEGMENT_START_CLASS = 'ui-field-group__segment--start' as const

export const UI_FIELD_GROUP_SEGMENT_END_CLASS = 'ui-field-group__segment--end' as const

export const UI_FIELD_GROUP_SEGMENT_SURFACE_FAINT_CLASS =
  'ui-field-group__segment--surface-faint' as const

export const UI_FIELD_GROUP_SEGMENT_RESET_CLASS = 'ui-field-group__segment-reset' as const

export const UI_FIELD_GROUP_INPUT_COLUMN_CLASS = 'ui-field-group__input-column' as const

export const UI_FIELD_GROUP_ACTION_SEGMENT_CLASS = 'ui-field-group__action-segment' as const

export const UI_FIELD_GROUP_INPUT_SEGMENT_CLASS = 'ui-field-group__input-segment' as const

export const UI_FIELD_GROUP_CARET_SLOT_CLASS = 'ui-field-group__caret-slot' as const

export const UI_FIELD_GROUP_CARET_SLOT_GROUPED_START_CLASS =
  'ui-field-group__caret-slot--grouped-start' as const

export const UI_FIELD_GROUP_VALUE_SLOT_START_CLASS = 'ui-field-group__value-slot--start' as const

export const UI_FIELD_GROUP_VALUE_SLOT_START_COMPACT_CLASS =
  'ui-field-group__value-slot--start-compact' as const

export const UI_FIELD_GROUP_VALUE_SLOT_MIDDLE_CLASS = 'ui-field-group__value-slot--middle' as const

export const UI_FIELD_GROUP_VALUE_SLOT_END_CLASS = 'ui-field-group__value-slot--end' as const

export const UI_FIELD_GROUP_VALUE_SLOT_END_SLOT_CLASS =
  'ui-field-group__value-slot--end-slot' as const

export const UI_FIELD_GROUP_VALUE_SLOT_STANDALONE_CLASS =
  'ui-field-group__value-slot--standalone' as const

export const UI_FIELD_GROUP_VALUE_SLOT_STANDALONE_SLOT_CLASS =
  'ui-field-group__value-slot--standalone-slot' as const

export function resolveFieldGroupDividerClass(strength: 'primary' | 'subtle' = 'primary'): string {
  return strength === 'subtle'
    ? UI_FIELD_GROUP_DIVIDER_SUBTLE_CLASS
    : UI_FIELD_GROUP_DIVIDER_PRIMARY_CLASS
}

export function resolveFieldGroupCaretSlotClass(options: { groupedStart?: boolean } = {}): string {
  return options.groupedStart
    ? `${UI_FIELD_GROUP_CARET_SLOT_CLASS} ${UI_FIELD_GROUP_CARET_SLOT_GROUPED_START_CLASS}`
    : UI_FIELD_GROUP_CARET_SLOT_CLASS
}

export function resolveFieldGroupInputSegmentClasses(size: FieldGroupSizeKey = 'md'): string {
  return `${resolveFieldGroupSizeClass(size)} ${UI_FIELD_GROUP_SEGMENT_RESET_CLASS} ${UI_FIELD_GROUP_INPUT_SEGMENT_CLASS}`
}

export function resolveFieldGroupActionSegmentClasses(size: FieldGroupSizeKey = 'md'): string {
  return `${resolveFieldGroupSizeClass(size)} ${UI_FIELD_GROUP_ACTION_SEGMENT_CLASS}`
}

export function resolveFieldGroupSegmentShellClasses(
  size: FieldGroupSizeKey,
  options: { position: 'start' | 'middle' | 'end'; surfaceFaint?: boolean },
): string {
  const positionClass =
    options.position === 'start'
      ? UI_FIELD_GROUP_SEGMENT_START_CLASS
      : options.position === 'end'
        ? UI_FIELD_GROUP_SEGMENT_END_CLASS
        : ''

  const surfaceClass = options.surfaceFaint ? UI_FIELD_GROUP_SEGMENT_SURFACE_FAINT_CLASS : ''

  return [
    resolveFieldGroupSizeClass(size),
    UI_FIELD_GROUP_SEGMENT_CLASS,
    positionClass,
    surfaceClass,
  ]
    .filter(Boolean)
    .join(' ')
}
