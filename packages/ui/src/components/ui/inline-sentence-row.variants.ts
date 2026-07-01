import { cva, type VariantProps } from 'class-variance-authority'

import { fieldSizeTypographyClasses } from './field-sizing.variants'

/** Glue text between inline sentence controls — size follows `fieldSizeTypographyClasses`. */
export const inlineSentenceConnectorVariants = cva('shrink-0 text-foreground', {
  variants: {
    size: fieldSizeTypographyClasses,
    tone: {
      /** Loose prose connectors (`through`, choose-count prefix/suffix). */
      prose: '',
      /** Grouped dice cluster separator (`d`, operators). */
      mono: 'px-2 font-mono font-medium',
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'prose',
  },
})

export type InlineSentenceConnectorVariantProps = VariantProps<
  typeof inlineSentenceConnectorVariants
>

/** Dice cluster alias — mono tone locked. */
export function diceFormulaSeparatorVariants(
  props: Pick<InlineSentenceConnectorVariantProps, 'size'>,
) {
  return inlineSentenceConnectorVariants({ ...props, tone: 'mono' })
}
