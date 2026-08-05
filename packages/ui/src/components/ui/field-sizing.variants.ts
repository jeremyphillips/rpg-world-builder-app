/**
 * Shared field sizing tokens.
 *
 * Keep these as literal Tailwind class maps so the scanner emits every size.
 * Component-specific variants should compose these maps instead of repeating
 * the sm/md/lg height, padding, and type-scale tuples.
 */
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

/**
 * Size-only classes for one segment inside a grouped control. Uses `pl-*`
 * instead of `px-*` so consumers can reserve their own trailing affordance.
 */
export const fieldGroupedControlSizeClasses = {
  sm: 'h-8 pl-2.5 py-1 text-xs',
  md: 'h-9 pl-3 py-1.5 text-md',
  lg: 'h-11 pl-4 py-2 text-base',
} as const satisfies Record<FieldSizeToken, string>

/** Multi-line controls (Textarea, JSON editor): min-height + padding + type scale. */
export const fieldTextareaSizeClasses = {
  sm: 'min-h-16 px-2.5 py-1.5 text-xs',
  md: 'min-h-20 px-3 py-2 text-md',
  lg: 'min-h-28 px-4 py-3 text-base',
} as const satisfies Record<FieldSizeToken, string>

/** Right-side reserve for digit controls with a trailing stepper/caret column. */
export const fieldDigitTrailingPaddingClasses = {
  sm: 'pr-6',
  md: 'pr-6',
  lg: 'pr-8',
} as const satisfies Record<FieldSizeToken, string>

/** Left + right padding for digit-sized controls. */
export const fieldDigitSizeClasses = {
  sm: 'pl-2.5 pr-6',
  md: 'pl-3 pr-6',
  lg: 'pl-4 pr-8',
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

/**
 * Maps array section field size to the paired add-button size. Array item fields
 * default to `sm`, but the add action uses the next visual step (`default` / md).
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
): ArrayAddButtonSize {
  return override ?? fieldSizeToArrayAddButtonSize[sectionSize]
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
