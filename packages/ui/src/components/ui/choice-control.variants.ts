import { cn } from '../../lib/utils'
import {
  interactiveFocusVariants,
  type InteractiveFocusVariantProps,
} from './interactive-focus.variants'
import {
  CHOICE_CONTROL_INDICATOR_SIZE_SPECS,
  UI_CHOICE_CONTROL_BLOCK_CLASS,
  UI_CHOICE_CONTROL_CIRCLE_CLASS,
  UI_CHOICE_CONTROL_CIRCLE_EXPAND_CLASS,
  UI_CHOICE_CONTROL_THUMB_CLASS,
  resolveChoiceControlIndicatorSizeClass,
  resolveChoiceControlKindClass,
  type ChoiceControlIndicatorSize,
  type ChoiceControlKind,
} from './choice-control.styles'

export const UI_CHOICE_CONTROL_MARK_CLASS = 'ui-choice-control__mark' as const

export {
  UI_CHOICE_CONTROL_CIRCLE_CLASS,
  UI_CHOICE_CONTROL_CIRCLE_EXPAND_CLASS,
  UI_CHOICE_CONTROL_EXPAND_ANCHOR_CLASS,
  UI_CHOICE_CONTROL_EXPAND_LABEL_CLASS,
} from './choice-control.styles'

export type CheckboxAppearance = 'default' | 'circle'

/** Where the control sits in the layout — not appearance or domain. */
export type ChoiceControlFocusContext = NonNullable<InteractiveFocusVariantProps['context']>

export function choiceControlClasses(
  kind: ChoiceControlKind,
  options: { className?: string; focusContext?: ChoiceControlFocusContext } = {},
): string {
  const focusContext = options.focusContext ?? 'standalone'
  return cn(
    UI_CHOICE_CONTROL_BLOCK_CLASS,
    resolveChoiceControlKindClass(kind),
    interactiveFocusVariants({ context: focusContext }),
    options.className,
  )
}

export function checkboxControlClasses(options?: {
  className?: string
  appearance?: CheckboxAppearance
  focusContext?: ChoiceControlFocusContext
  /** Horizontal label reveal. Only valid with `appearance: 'circle'`. */
  expand?: boolean
}): string {
  const appearance = options?.appearance ?? 'default'
  const focusContext = options?.focusContext ?? 'standalone'
  const expand = appearance === 'circle' && options?.expand === true
  return choiceControlClasses('checkbox', {
    focusContext,
    className: cn(
      'peer',
      appearance === 'circle' && UI_CHOICE_CONTROL_CIRCLE_CLASS,
      expand && UI_CHOICE_CONTROL_CIRCLE_EXPAND_CLASS,
      options?.className,
    ),
  })
}

export function radioGroupItemControlClasses(className?: string): string {
  return choiceControlClasses('radio', { className })
}

export function switchControlClasses(className?: string): string {
  return choiceControlClasses('switch', { className: cn('peer inline-flex', className) })
}

export function switchThumbClasses(className?: string): string {
  return cn(UI_CHOICE_CONTROL_THUMB_CLASS, className)
}

export function radioCardDecorativeControlClasses({
  indicatorSize = 'lg',
  className,
}: {
  indicatorSize?: ChoiceControlIndicatorSize
  className?: string
} = {}): string {
  return cn(
    UI_CHOICE_CONTROL_BLOCK_CLASS,
    resolveChoiceControlKindClass('radio'),
    resolveChoiceControlIndicatorSizeClass(indicatorSize),
    'flex aspect-square shrink-0 items-center justify-center',
    className,
  )
}

/** Maps RadioCard density × variant to indicator size spec (for ClassReference). */
export function resolveRadioCardIndicatorSize(options: {
  variant: 'card' | 'row'
  density: 'default' | 'compact'
}): ChoiceControlIndicatorSize {
  if (options.variant === 'row') return 'sm'
  if (options.density === 'compact') return 'sm'
  return 'lg'
}

export const RADIO_CARD_INDICATOR_REFERENCE_ROWS = [
  {
    key: 'card-default',
    indicatorSize: 'lg' as const,
    propsLabel: 'variant="card" density="default"',
    useCase: CHOICE_CONTROL_INDICATOR_SIZE_SPECS.find((spec) => spec.size === 'lg')?.useCase ?? '',
  },
  {
    key: 'card-compact',
    indicatorSize: 'sm' as const,
    propsLabel: 'variant="card" density="compact"',
    useCase: CHOICE_CONTROL_INDICATOR_SIZE_SPECS.find((spec) => spec.size === 'sm')?.useCase ?? '',
  },
  {
    key: 'row',
    indicatorSize: 'sm' as const,
    propsLabel: 'variant="row"',
    useCase: 'Row-style radio options',
  },
] as const
