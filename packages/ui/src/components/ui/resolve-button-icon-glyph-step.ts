import type { ButtonVariantProps } from './button.variants'
import type { IconGlyphStep } from './icon-glyph.variants'

function resolveIconOnlyButtonGlyphStep(
  size: ButtonVariantProps['size'],
  density: ButtonVariantProps['density'],
): IconGlyphStep | undefined {
  if (size === 'icon-xs') return 'xs'
  if (size === 'icon-lg') return 'lg'
  if (size === 'icon') return density === 'compact' ? 'md' : 'lg'
  return undefined
}

function resolveTextButtonGlyphStep(
  size: ButtonVariantProps['size'],
  density: ButtonVariantProps['density'],
): IconGlyphStep {
  if (size === 'xs' && density === 'compact') return 'xs'
  if (size === 'xs') return 'sm'
  if (density === 'compact') return 'sm'
  return 'lg'
}

function resolveAttachedButtonGlyphStep(
  size: ButtonVariantProps['size'],
): IconGlyphStep | undefined {
  if (size === 'xs') return 'xs'
  if (size === 'sm') return 'sm'
  return undefined
}

/**
 * Default leading-icon scale for a Button size/density/variant pairing.
 * Keeps ActionButton root Lucide classes aligned with buttonVariants descendant rules.
 */
export function resolveButtonIconGlyphStep(
  size: ButtonVariantProps['size'] = 'default',
  density: ButtonVariantProps['density'] = 'default',
  variant: ButtonVariantProps['variant'] = 'default',
): IconGlyphStep {
  const iconOnly = resolveIconOnlyButtonGlyphStep(size, density)
  if (iconOnly) return iconOnly
  if (variant === 'text') return resolveTextButtonGlyphStep(size, density)
  if (size === 'xs') return 'xs'
  if (size === 'sm') return 'sm'
  const attached = variant === 'attached' ? resolveAttachedButtonGlyphStep(size) : undefined
  if (attached) return attached
  return 'lg'
}
