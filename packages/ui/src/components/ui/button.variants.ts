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

export type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'

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

function isIconOnlyButtonSize(
  size: ButtonSize,
): size is 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg' {
  return size === 'icon' || size === 'icon-xs' || size === 'icon-sm' || size === 'icon-lg'
}

function resolveButtonSizeClasses({
  variant,
  size = 'default',
}: {
  variant: ButtonVariant
  size?: ButtonSize
}): string | null {
  if (variant === 'text') {
    if (isIconOnlyButtonSize(size)) {
      return cn(UI_BUTTON_TEXT_SIZE_CLASS, resolveButtonChromeSizeClass(size))
    }
    return cn(UI_BUTTON_TEXT_SIZE_CLASS, resolveTextButtonGeometryClass(resolveTextSizeKey(size)))
  }

  if (variant === 'attached') {
    const attachedSize = resolveAttachedSizeKey(size)
    return cn(
      UI_BUTTON_ATTACHED_SIZE_CLASS,
      ATTACHED_TIER_CLASS[attachedSize],
      fieldGroupedSegmentEndClasses,
    )
  }

  if (isIconOnlyButtonSize(size)) {
    return resolveButtonChromeSizeClass(size)
  }

  return resolveButtonChromeSizeClass(resolveLabeledSizeKey(size))
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
}: {
  variant?: ButtonVariant
  size?: ButtonSize
} = {}) {
  return cn(
    UI_BUTTON_BLOCK_CLASS,
    'font-body-emphasis',
    interactiveFocusVariants({ context: 'standalone' }),
    resolveButtonAppearanceClass(variant),
    resolveButtonSizeClasses({ variant, size }),
  )
}

export type ButtonVariantProps = {
  variant?: ButtonVariant
  size?: ButtonSize
}
