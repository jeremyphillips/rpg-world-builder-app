export type FloatingLabelFieldSize = 'sm' | 'md'

export const FLOATING_LABEL_BLOCK_CLASS = 'ui-floating-label-field' as const
export const FLOATING_LABEL_LAYER_CLASS = 'ui-floating-label-field__layer' as const
export const FLOATING_LABEL_LABEL_CLASS = 'ui-floating-label-field__label' as const
export const FLOATING_LABEL_TEXT_CLASS = 'ui-floating-label-field__text' as const

export type FloatingLabelSizeSpec = {
  size: FloatingLabelFieldSize
  className: string
  controlHeight: string
  floatedLabelSize: string
  useCase: string
}

export const FLOATING_LABEL_SIZE_SPECS: readonly FloatingLabelSizeSpec[] = [
  {
    size: 'sm',
    className: 'ui-floating-label-field--sm',
    controlHeight: '32px',
    floatedLabelSize: 'var(--field-floating-label-sm)',
    useCase: 'Compact filters and dense forms',
  },
  {
    size: 'md',
    className: 'ui-floating-label-field--md',
    controlHeight: '36px',
    floatedLabelSize: 'var(--field-floating-label-md)',
    useCase: 'Default comfortable fields',
  },
]
