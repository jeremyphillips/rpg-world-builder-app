import type { ButtonVariantProps } from './button.variants'
import type { GenericCardDensity } from './card.variants'

/** Labeled actions on Card footers and Alert action regions — explicit `size` at call sites. */
export function resolveSurfaceActionButtonSize(
  density: GenericCardDensity = 'comfortable',
): NonNullable<ButtonVariantProps['size']> {
  return density === 'spacious' ? 'default' : 'sm'
}
