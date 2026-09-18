/**
 * Shared field sizing tokens.
 *
 * Keep these as literal Tailwind class maps so the scanner emits every size.
 * Component-specific variants should compose these maps instead of repeating
 * the sm/md/lg height, padding, and type-scale tuples.
 */
import { cn } from '../../lib/utils'
import type { ButtonVariantProps } from './button.variants'
import { iconGlyphDescendantClasses } from './icon-glyph.variants'

export type FieldSizeToken = 'sm' | 'md' | 'lg'

/** Shared type scale for labels and controls at each field size. */
export const fieldSizeTypographyClasses = {
  sm: 'text-xs',
  md: 'text-md',
  lg: 'text-base',
} as const satisfies Record<FieldSizeToken, string>

export const fieldControlSizeClasses = {
  sm: 'h-8 px-2.5 py-1 text-xs',
  md: 'h-9 px-3 py-1.5 text-md',
  lg: 'h-11 px-4 py-2 text-base',
} as const satisfies Record<FieldSizeToken, string>

/** Grouped segment outer height — no padding or typography. */
export const fieldGroupedControlHeightClasses = {
  sm: 'h-8',
  md: 'h-9',
  lg: 'h-11',
} as const satisfies Record<FieldSizeToken, string>

/** Grouped segment height and vertical padding — no typography. */
export const fieldGroupedControlGeometryClasses = {
  sm: cn(fieldGroupedControlHeightClasses.sm, 'py-1'),
  md: cn(fieldGroupedControlHeightClasses.md, 'py-1.5'),
  lg: cn(fieldGroupedControlHeightClasses.lg, 'py-2'),
} as const satisfies Record<FieldSizeToken, string>

/** Positional value-slot padding — outer-start content inset (`GroupedValueSlot position="start"`). */
export const fieldGroupedValueSlotStartPaddingClasses = {
  sm: 'ps-2.5',
  md: 'ps-3',
  lg: 'ps-4',
} as const satisfies Record<FieldSizeToken, string>

/** Compact outer-start inset for static prefix glyphs (`×`, …) — not editable value cells. */
export const fieldGroupedValueSlotStartCompactPaddingClasses = {
  sm: 'ps-1.5',
  md: 'ps-2',
  lg: 'ps-2.5',
} as const satisfies Record<FieldSizeToken, string>

/** Positional value-slot padding — middle segment content. */
export const fieldGroupedValueSlotMiddlePaddingClasses = {
  sm: 'ps-1.5 pe-1.5',
  md: 'ps-2 pe-2',
  lg: 'ps-2.5 pe-2.5',
} as const satisfies Record<FieldSizeToken, string>

/** End value-slot padding when trailing content owns both edges (labels, static segments). */
export const fieldGroupedValueSlotEndContentPaddingClasses = {
  sm: 'ps-1.5 pe-2',
  md: 'ps-2 pe-2.5',
  lg: 'ps-2.5 pe-3',
} as const satisfies Record<FieldSizeToken, string>

/** End value-slot padding when a sibling trailing slot follows (select, searchable unit). */
export const fieldGroupedValueSlotEndTrailingSlotPaddingClasses = {
  sm: 'ps-1.5 pe-1',
  md: 'ps-2 pe-1',
  lg: 'ps-2.5 pe-1',
} as const satisfies Record<FieldSizeToken, string>

/** Trailing buffer on standalone value cells before a sibling trailing slot. */
export const fieldGroupedValueSlotBeforeTrailingSlotPaddingClasses = {
  sm: 'pe-1',
  md: 'pe-1',
  lg: 'pe-1',
} as const satisfies Record<FieldSizeToken, string>

/** @deprecated Prefer `fieldGroupedValueSlotEndContentPaddingClasses`. */
export const fieldGroupedValueSlotEndPaddingClasses = fieldGroupedValueSlotEndContentPaddingClasses

/** @deprecated Prefer `fieldGroupedValueSlotStartPaddingClasses`. */
export const fieldGroupedControlStartContentPaddingClasses =
  fieldGroupedValueSlotStartPaddingClasses

/** @deprecated Prefer `fieldGroupedValueSlotStartPaddingClasses`. */
export const fieldGroupedControlStartPaddingClasses = fieldGroupedValueSlotStartPaddingClasses

/** @deprecated Prefer `fieldGroupedValueSlotEndPaddingClasses` (leading `ps-*` only). */
export const fieldGroupedControlEndContentPaddingClasses = {
  sm: 'ps-1.5',
  md: 'ps-2',
  lg: 'ps-2.5',
} as const satisfies Record<FieldSizeToken, string>

/** @deprecated Prefer `fieldGroupedValueSlotEndPaddingClasses` (trailing `pe-*` only). */
export const fieldGroupedLabelValueSlotPaddingClasses = {
  sm: 'pe-2',
  md: 'pe-2.5',
  lg: 'pe-3',
} as const satisfies Record<FieldSizeToken, string>

/** @deprecated Caret column owns trailing inset — not part of value-slot padding. */
export const fieldGroupedValueSlotBeforeCaretPaddingClasses = {
  sm: 'pe-1',
  md: 'pe-1',
  lg: 'pe-1',
} as const satisfies Record<FieldSizeToken, string>

/** Horizontal padding for grouped trailing action segments. */
export const fieldGroupedControlActionPaddingClasses = {
  sm: 'px-2.5',
  md: 'px-3',
  lg: 'px-3.5',
} as const satisfies Record<FieldSizeToken, string>

/**
 * Size classes for one segment inside a grouped control when the segment element
 * owns field typography (input/select value cells). Uses `pl-*` instead of `px-*`
 * so consumers can reserve their own trailing affordance.
 */
export const fieldGroupedControlSizeClasses = {
  sm: cn(
    fieldGroupedControlGeometryClasses.sm,
    fieldGroupedControlStartPaddingClasses.sm,
    fieldSizeTypographyClasses.sm,
  ),
  md: cn(
    fieldGroupedControlGeometryClasses.md,
    fieldGroupedControlStartPaddingClasses.md,
    fieldSizeTypographyClasses.md,
  ),
  lg: cn(
    fieldGroupedControlGeometryClasses.lg,
    fieldGroupedControlStartPaddingClasses.lg,
    fieldSizeTypographyClasses.lg,
  ),
} as const satisfies Record<FieldSizeToken, string>

/** Multi-line controls (Textarea, JSON editor): min-height + padding + type scale. */
export const fieldTextareaSizeClasses = {
  sm: 'min-h-16 px-2.5 py-1.5 text-xs',
  md: 'min-h-20 px-3 py-2 text-md',
  lg: 'min-h-28 px-4 py-3 text-base',
} as const satisfies Record<FieldSizeToken, string>

/** Trailing reserve for digit controls with a stepper/caret column (logical). */
export const fieldDigitTrailingPaddingClasses = {
  sm: 'pe-6',
  md: 'pe-6',
  lg: 'pe-8',
} as const satisfies Record<FieldSizeToken, string>

/** Start + trailing padding for digit-sized controls (logical). */
export const fieldDigitSizeClasses = {
  sm: 'ps-2.5 pe-6',
  md: 'ps-3 pe-6',
  lg: 'ps-4 pe-8',
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

/** Maps field control size to removable chip size (`sm` fields use `md` — removable chips have no `sm`). */
export const fieldSizeToChipSize = {
  sm: 'md',
  md: 'md',
  lg: 'lg',
} as const satisfies Record<FieldSizeToken, 'md' | 'lg'>

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

/** Maps outline button size to combobox search row field size. */
export const buttonSizeToComboboxFieldSize = {
  sm: 'sm',
  default: 'md',
  lg: 'lg',
  icon: 'md',
  'icon-lg': 'lg',
} as const satisfies Record<'sm' | 'default' | 'lg' | 'icon' | 'icon-lg', FieldSizeToken>

/** Icon sizing that pairs with `fieldDigitTrailingColumnClasses`. sm≡xs for digit chrome. */
export const fieldDigitTrailingIconClasses = {
  sm: iconGlyphDescendantClasses.xs,
  md: iconGlyphDescendantClasses.xs,
  lg: iconGlyphDescendantClasses.md,
} as const satisfies Record<FieldSizeToken, string>
