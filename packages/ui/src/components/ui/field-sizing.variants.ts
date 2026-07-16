/**
 * Shared field sizing tokens.
 *
 * Keep these as literal Tailwind class maps so the scanner emits every size.
 * Component-specific variants should compose these maps instead of repeating
 * the sm/md/lg height, padding, and type-scale tuples.
 */
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

/** Icon sizing that pairs with `fieldDigitTrailingColumnClasses`. */
export const fieldDigitTrailingIconClasses = {
  sm: '[&_svg]:size-2.5',
  md: '[&_svg]:size-2.5',
  lg: '[&_svg]:size-3.5',
} as const satisfies Record<FieldSizeToken, string>
