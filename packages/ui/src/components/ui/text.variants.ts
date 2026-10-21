import { cva, type VariantProps } from 'class-variance-authority'

export const TEXT_VARIANT_MAP = {
  body: 'text-style-body',
  muted: 'text-style-muted',
  supporting: 'text-style-supporting',
  caption: 'text-style-caption',
  label: 'text-style-label',
  emphasis: 'text-style-emphasis',
  option: 'text-style-option',
  lead: 'text-style-lead',
  info: 'text-style-info',
  success: 'text-style-success',
  warning: 'text-style-warning',
  destructive: 'text-style-destructive',
} as const

export type TextVariant = keyof typeof TEXT_VARIANT_MAP

export const TEXT_VARIANTS = Object.keys(TEXT_VARIANT_MAP) as TextVariant[]

export const textVariants = cva('', {
  variants: {
    variant: TEXT_VARIANT_MAP,
  },
  defaultVariants: {
    variant: 'body',
  },
})

export type TextVariantProps = VariantProps<typeof textVariants>
