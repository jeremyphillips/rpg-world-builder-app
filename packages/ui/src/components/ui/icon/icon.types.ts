import type { IconName } from './icon-glyphs'

/** 10 12 14 16 20 24 32 */
export const ICON_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const
export type IconSize = (typeof ICON_SIZES)[number]
export type IconSizeMode = IconSize | 'inline' | 'owner'

/**
 * A mapped `` aria-${string} `` / `` data-${string} `` `never` type does not
 * reject hyphenated JSX attributes in this TypeScript version, so the forbidden
 * keys are listed explicitly.
 */
type ForbiddenIconAttributes = {
  'aria-label'?: never
  'aria-labelledby'?: never
  'aria-hidden'?: never
  'data-testid'?: never
  role?: never
  title?: never
  style?: never
}

export type IconProps = ForbiddenIconAttributes & {
  name: IconName
  size: IconSizeMode
  className?: string
}

export type { IconName }
