/**
 * Shared field sizing tokens.
 *
 * Grouped composite geometry lives in field-group.css — use field-group.styles resolvers.
 * Component-specific variants should compose these maps instead of repeating tuples.
 */
import type { ButtonVariantProps } from './button.variants'
import {
  resolveFieldControlDigitsSizeClass,
  resolveFieldControlMultilineSizeClass,
  resolveFieldControlSizeClass,
} from './field-control.styles'
import {
  resolveFieldGroupActionSegmentClasses,
  resolveFieldGroupInputSegmentClasses,
  resolveFieldGroupSizeClass,
} from './field-group.styles'
import type { CompactLabelSize } from './compact-label.lib'
import { iconGlyphDescendantClasses } from './icon-glyph.variants'
import type { InteractiveListSize } from './interactive-list.variants'

export type FieldSizeToken = 'sm' | 'md' | 'lg'

/** Shared type scale for labels and controls at each field size. */
export const fieldSizeTypographyClasses = {
  sm: 'text-xs',
  md: 'text-md',
  lg: 'text-base',
} as const satisfies Record<FieldSizeToken, string>

export const fieldControlSizeClasses = {
  sm: resolveFieldControlSizeClass('sm'),
  md: resolveFieldControlSizeClass('md'),
  lg: resolveFieldControlSizeClass('lg'),
} as const satisfies Record<FieldSizeToken, string>

/** @deprecated Prefer {@link resolveFieldGroupActionSegmentClasses}. */
export const fieldGroupedControlHeightClasses = {
  sm: resolveFieldGroupActionSegmentClasses('sm'),
  md: resolveFieldGroupActionSegmentClasses('md'),
  lg: resolveFieldGroupActionSegmentClasses('lg'),
} as const satisfies Record<FieldSizeToken, string>

/** @deprecated Prefer {@link resolveFieldGroupInputSegmentClasses}. */
export const fieldGroupedControlSizeClasses = {
  sm: resolveFieldGroupInputSegmentClasses('sm'),
  md: resolveFieldGroupInputSegmentClasses('md'),
  lg: resolveFieldGroupInputSegmentClasses('lg'),
} as const satisfies Record<FieldSizeToken, string>

/** Multi-line controls (Textarea, JSON editor): min-height + padding + type scale. */
export const fieldTextareaSizeClasses = {
  sm: resolveFieldControlMultilineSizeClass('sm'),
  md: resolveFieldControlMultilineSizeClass('md'),
  lg: resolveFieldControlMultilineSizeClass('lg'),
} as const satisfies Record<FieldSizeToken, string>

/** Trailing reserve for digit controls with a stepper/caret column (logical). */
export const fieldDigitTrailingPaddingClasses = {
  sm: 'pe-6',
  md: 'pe-6',
  lg: 'pe-8',
} as const satisfies Record<FieldSizeToken, string>

/** Start + trailing padding for digit-sized controls (logical). */
export const fieldDigitSizeClasses = {
  sm: resolveFieldControlDigitsSizeClass('sm'),
  md: resolveFieldControlDigitsSizeClass('md'),
  lg: resolveFieldControlDigitsSizeClass('lg'),
} as const satisfies Record<FieldSizeToken, string>

/** Width of the trailing stepper/caret column on digit-sized controls. */
export const fieldDigitTrailingColumnClasses = {
  sm: 'w-5',
  md: 'w-5',
  lg: 'w-7',
} as const satisfies Record<FieldSizeToken, string>

/** Maps field control size to badge size (`Badge` defines `sm` | `md` | `lg`). */
export const fieldSizeToBadgeSize = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
} as const satisfies Record<FieldSizeToken, 'sm' | 'md' | 'lg'>

/** Maps field control size to removable chip size (1:1 with control scale). */
export const fieldSizeToChipSize = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
} as const satisfies Record<FieldSizeToken, CompactLabelSize>

export const fieldSizeToAttachedButtonSize = {
  sm: 'sm',
  md: 'default',
  lg: 'lg',
} as const satisfies Record<FieldSizeToken, NonNullable<ButtonVariantProps['size']>>

/** Resolves attached trailing-action button size from field control scale. */
export function resolveAttachedButtonSize(
  fieldSize: FieldSizeToken,
): NonNullable<ButtonVariantProps['size']> {
  return fieldSizeToAttachedButtonSize[fieldSize]
}

/** Default button size for inline section header actions (legend-row add controls). */
export const INLINE_HEADER_ACTION_BUTTON_SIZE = 'sm' as const satisfies NonNullable<
  ButtonVariantProps['size']
>

/**
 * Maps array section field size to the paired stacked add-button size. Stacked
 * add actions use the next visual step (`default` / md) above item field scale.
 */
export const fieldSizeToArrayAddButtonSize = {
  sm: 'default',
  md: 'default',
  lg: 'lg',
} as const satisfies Record<FieldSizeToken, 'default' | 'lg'>

type ArrayAddButtonSize = NonNullable<ButtonVariantProps['size']>

/** Resolves array add-control button size — explicit override wins over section rhythm. */
export function resolveArrayAddButtonSize(
  sectionSize: FieldSizeToken,
  override?: ArrayAddButtonSize,
  layout: 'inline' | 'stacked' = 'stacked',
): ArrayAddButtonSize {
  if (override) return override
  if (layout === 'inline') return INLINE_HEADER_ACTION_BUTTON_SIZE
  return fieldSizeToArrayAddButtonSize[sectionSize]
}

/**
 * Textual Button sizes → combobox search row field band. Compatibility mapping for
 * dropdown UX — not field geometry parity with icon hit targets.
 */
export const buttonTextSizeToComboboxFieldSize = {
  xs: 'sm',
  sm: 'sm',
  default: 'md',
  lg: 'lg',
} as const satisfies Record<'xs' | 'sm' | 'default' | 'lg', FieldSizeToken>

/** Icon button sizes do not imply a field band; use for dropdown search rows only. */
export const COMBOBOX_SEARCH_FIELD_SIZE_FOR_ICON_BUTTON = 'md' as const satisfies FieldSizeToken

/** Resolves combobox search field size from Button `size` (textual vs icon). */
export function resolveComboboxSearchFieldSizeForButtonSize(
  size?: ButtonVariantProps['size'] | null,
): FieldSizeToken {
  if (size == null || size === 'default') {
    return buttonTextSizeToComboboxFieldSize.default
  }
  if (size in buttonTextSizeToComboboxFieldSize) {
    return buttonTextSizeToComboboxFieldSize[size as keyof typeof buttonTextSizeToComboboxFieldSize]
  }
  return COMBOBOX_SEARCH_FIELD_SIZE_FOR_ICON_BUTTON
}

/** Combobox field band → interactive list row scale (not field typography). */
export const fieldSizeToInteractiveListSize = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
} as const satisfies Record<FieldSizeToken, InteractiveListSize>

export function resolveInteractiveListSizeForFieldSize(
  fieldSize: FieldSizeToken = 'md',
): InteractiveListSize {
  return fieldSizeToInteractiveListSize[fieldSize]
}

/** Icon sizing that pairs with `fieldDigitTrailingColumnClasses`. sm≡xs for digit chrome. */
export const fieldDigitTrailingIconClasses = {
  sm: iconGlyphDescendantClasses.xs,
  md: iconGlyphDescendantClasses.xs,
  lg: iconGlyphDescendantClasses.md,
} as const satisfies Record<FieldSizeToken, string>

/** Resolves grouped shell size modifier for composite roots. */
export function resolveFieldGroupedShellSizeClass(size: FieldSizeToken = 'md'): string {
  return resolveFieldGroupSizeClass(size)
}
