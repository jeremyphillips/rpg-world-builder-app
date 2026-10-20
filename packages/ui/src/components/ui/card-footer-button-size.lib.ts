import type { ButtonVariantProps } from './button.variants'
import type { GenericCardDensity } from './card.variants'

/** Labeled footer actions on generic `Card` — explicit `Button` / `ButtonLink` `size` at call sites. */
export function resolveCardFooterButtonSize(
  density: GenericCardDensity = 'comfortable',
): NonNullable<ButtonVariantProps['size']> {
  return density === 'spacious' ? 'default' : 'sm'
}
