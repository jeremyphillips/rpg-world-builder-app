import { cn } from '../../lib/utils'
import { fieldGroupedSegmentEndClasses } from './field-input-chrome.variants'
import { interactiveFocusVariants } from './interactive-focus.variants'
import {
  BUTTON_VARIANT_TO_APPEARANCE,
  UI_BUTTON_BLOCK_CLASS,
  UI_BUTTON_ATTACHED_SIZE_CLASS,
  UI_BUTTON_TEXT_SIZE_CLASS,
  resolveButtonChromeSizeClass,
  resolveTextButtonGeometryClass,
  type ButtonDensityKey,
  type ButtonTextSizeKey,
} from './button.styles'

type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'warning'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'text'
  | 'attached'

type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-lg'

const ATTACHED_TIER_CLASS = {
  xs: 'ui-button--attached-xs',
  sm: 'ui-button--attached-sm',
  default: 'ui-button--attached-md',
  lg: 'ui-button--attached-lg',
} as const satisfies Record<'default' | 'xs' | 'sm' | 'lg', string>

function resolveAttachedSizeKey(size: ButtonSize): keyof typeof ATTACHED_TIER_CLASS {
  if (size === 'xs' || size === 'sm' || size === 'lg') return size
  return 'default'
}

function resolveTextSizeKey(size: ButtonSize): ButtonTextSizeKey {
  if (size === 'xs' || size === 'sm' || size === 'lg') return size
  return 'default'
}

function resolveLabeledSizeKey(size: ButtonSize): 'default' | 'xs' | 'sm' | 'lg' {
  if (size === 'xs' || size === 'sm' || size === 'lg') return size
  return 'default'
}

function resolveButtonSizeClasses({
  variant,
  size = 'default',
  density = 'default',
}: {
  variant: ButtonVariant
  size?: ButtonSize
  density?: ButtonDensityKey
}): string | null {
  if (variant === 'text') {
    return cn(
      UI_BUTTON_TEXT_SIZE_CLASS,
      resolveTextButtonGeometryClass(resolveTextSizeKey(size), density),
    )
  }

  if (variant === 'attached') {
    const attachedSize = resolveAttachedSizeKey(size)
    return cn(
      UI_BUTTON_ATTACHED_SIZE_CLASS,
      ATTACHED_TIER_CLASS[attachedSize],
      fieldGroupedSegmentEndClasses,
    )
  }

  if (size === 'icon' || size === 'icon-xs' || size === 'icon-lg') {
    return resolveButtonChromeSizeClass(size, density)
  }

  return resolveButtonChromeSizeClass(resolveLabeledSizeKey(size), density)
}

function resolveButtonAppearanceClass(variant: ButtonVariant): string | null {
  if (variant === 'text' || variant === 'attached') return null
  return BUTTON_VARIANT_TO_APPEARANCE[variant]
}

/**
 * Button class variants. Kept in a non-client module so server components (e.g.
 * styling a Next.js `<Link>`) can call `buttonVariants()` without pulling in the
 * client boundary of `button.tsx`.
 */
export function buttonVariants({
  variant = 'default',
  size = 'default',
  density = 'default',
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  density?: ButtonDensityKey
} = {}) {
  return cn(
    UI_BUTTON_BLOCK_CLASS,
    'font-body-emphasis',
    interactiveFocusVariants({ context: 'standalone' }),
    resolveButtonAppearanceClass(variant),
    resolveButtonSizeClasses({ variant, size, density }),
  )
}

export type ButtonVariantProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  density?: ButtonDensityKey
}
