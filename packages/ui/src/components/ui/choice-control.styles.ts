export const UI_CHOICE_CONTROL_BLOCK_CLASS = 'ui-choice-control' as const

export const UI_CHOICE_CONTROL_THUMB_CLASS = 'ui-choice-control__thumb' as const

/** Opt-in checkbox appearance — circular indicator on a 24px hit target. */
export const UI_CHOICE_CONTROL_CIRCLE_CLASS = 'ui-choice-control--circle' as const

/** Circle checkbox that reveals a label on hover and focus without growing layout. */
export const UI_CHOICE_CONTROL_CIRCLE_EXPAND_CLASS = 'ui-choice-control--circle-expand' as const

export const UI_CHOICE_CONTROL_EXPAND_ANCHOR_CLASS = 'ui-choice-control-expand-anchor' as const

export const UI_CHOICE_CONTROL_EXPAND_LABEL_CLASS = 'ui-choice-control__expand-label' as const

export const UI_CHOICE_CONTROL_EXPAND_CLIP_CLASS = 'ui-choice-control__expand-clip' as const

export const UI_CHOICE_CONTROL_EXPAND_RESERVE_CLASS = 'ui-choice-control__expand-reserve' as const

export type ChoiceControlKind = 'checkbox' | 'radio' | 'switch'

export type ChoiceControlKindSpec = {
  kind: ChoiceControlKind
  className: string
  controlSize: string
  useCase: string
}

export const CHOICE_CONTROL_KIND_SPECS: readonly ChoiceControlKindSpec[] = [
  {
    kind: 'checkbox',
    className: 'ui-choice-control--checkbox',
    controlSize: '16×16px',
    useCase: 'Boolean filters and form checkboxes',
  },
  {
    kind: 'radio',
    className: 'ui-choice-control--radio',
    controlSize: '16×16px',
    useCase: 'Exclusive option groups',
  },
  {
    kind: 'switch',
    className: 'ui-choice-control--switch',
    controlSize: '36×20px track',
    useCase: 'Persistent settings toggles',
  },
] as const

export type ChoiceControlIndicatorSize = 'sm' | 'lg'

export type ChoiceControlIndicatorSizeSpec = {
  size: ChoiceControlIndicatorSize
  className: string
  controlSize: string
  useCase: string
}

/** Decorative radio indicators (RadioCard) — geometry only; pairs with `--radio`. */
export const CHOICE_CONTROL_INDICATOR_SIZE_SPECS: readonly ChoiceControlIndicatorSizeSpec[] = [
  {
    size: 'sm',
    className: 'ui-choice-control--indicator-sm',
    controlSize: '16×16px',
    useCase: 'Compact card and row radio options',
  },
  {
    size: 'lg',
    className: 'ui-choice-control--indicator-lg',
    controlSize: '20×20px',
    useCase: 'Default card-variant radio decoration',
  },
] as const

const CHOICE_CONTROL_KIND_CLASS: Record<ChoiceControlKind, string> = {
  checkbox: 'ui-choice-control--checkbox',
  radio: 'ui-choice-control--radio',
  switch: 'ui-choice-control--switch',
}

const CHOICE_CONTROL_INDICATOR_SIZE_CLASS: Record<ChoiceControlIndicatorSize, string> = {
  sm: 'ui-choice-control--indicator-sm',
  lg: 'ui-choice-control--indicator-lg',
}

export function resolveChoiceControlKindClass(kind: ChoiceControlKind): string {
  return CHOICE_CONTROL_KIND_CLASS[kind]
}

export function resolveChoiceControlIndicatorSizeClass(size: ChoiceControlIndicatorSize): string {
  return CHOICE_CONTROL_INDICATOR_SIZE_CLASS[size]
}

/** twMerge groups — derived from choice control specs. */
export const UI_CHOICE_CONTROL_KIND_CLASSES = CHOICE_CONTROL_KIND_SPECS.map(
  (spec) => spec.className,
) as readonly string[]

export const UI_CHOICE_CONTROL_INDICATOR_SIZE_CLASSES = CHOICE_CONTROL_INDICATOR_SIZE_SPECS.map(
  (spec) => spec.className,
) as readonly string[]
