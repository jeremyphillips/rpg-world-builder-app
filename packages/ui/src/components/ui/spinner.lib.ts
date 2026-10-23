import type { IconSize } from './icon/icon.types'
import type { SpinnerVariantProps } from './spinner.variants'

export const SPINNER_ICON_SIZES = {
  sm: 'sm',
  default: 'lg',
  lg: '2xl',
  xl: '3xl',
} as const satisfies Record<NonNullable<SpinnerVariantProps['size']>, IconSize>
