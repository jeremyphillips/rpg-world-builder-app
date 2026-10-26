import { cn } from '../../lib/utils'
import { buttonVariants, type ButtonVariantProps } from './button.variants'
import { textActionVariants, type TextActionTone } from './text-action.variants'

type ButtonAppearanceShared = {
  size?: ButtonVariantProps['size']
  className?: string
}

/** Visual props shared by `Button` and `ButtonLink` (mirrors `ButtonProps` variant/tone rules). */
export type ResolveButtonAppearanceProps = ButtonAppearanceShared &
  (
    | { variant?: Exclude<ButtonVariantProps['variant'], 'text'>; tone?: never }
    | { variant: 'text'; tone?: TextActionTone }
  )

type ResolveButtonAppearanceInput = ButtonAppearanceShared & {
  variant?: ButtonVariantProps['variant']
  tone?: TextActionTone
}

/** Full Button chrome class list — shared by `Button` and `ButtonLink`. */
export function resolveButtonAppearance({
  variant = 'default',
  size,
  tone,
  className,
}: ResolveButtonAppearanceInput = {}): string {
  const resolvedVariant = variant ?? 'default'

  return cn(
    buttonVariants({ variant: resolvedVariant, size }),
    resolvedVariant === 'text' ? textActionVariants({ context: 'standalone', tone }) : null,
    className,
  )
}
