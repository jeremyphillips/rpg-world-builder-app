import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  FLOATING_LABEL_BLOCK_CLASS,
  FLOATING_LABEL_LABEL_CLASS,
  FLOATING_LABEL_LAYER_CLASS,
  FLOATING_LABEL_SIZE_SPECS,
  FLOATING_LABEL_TEXT_CLASS,
} from './floating-label-field.styles'

const floatingLabelSizeClass: Record<FloatingLabelFieldSize, string> = {
  sm: FLOATING_LABEL_SIZE_SPECS.find((spec) => spec.size === 'sm')!.className,
  md: FLOATING_LABEL_SIZE_SPECS.find((spec) => spec.size === 'md')!.className,
}

export const floatingLabelShellVariants = cva(FLOATING_LABEL_BLOCK_CLASS, {
  variants: {
    size: floatingLabelSizeClass,
  },
  defaultVariants: {
    size: 'md',
  },
})

export const floatingLabelLayerVariants = cva(FLOATING_LABEL_LAYER_CLASS, {
  variants: {
    size: {
      sm: '',
      md: '',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const floatingLabelTextVariants = cva(cn(FLOATING_LABEL_LABEL_CLASS, 'rtl:origin-right'), {
  variants: {
    size: {
      sm: '',
      md: '',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export const floatingLabelTextClipClass = FLOATING_LABEL_TEXT_CLASS

export type { FloatingLabelFieldSize } from './floating-label-field.styles'

export type FloatingLabelFieldSizeProp = NonNullable<
  VariantProps<typeof floatingLabelShellVariants>['size']
>
