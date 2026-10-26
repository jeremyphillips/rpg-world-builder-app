import { cva, type VariantProps } from 'class-variance-authority'

export const STATUS_DOT_TONES = [
  'neutral',
  'info',
  'success',
  'warning',
  'destructive',
  'sunken',
] as const

const STATUS_DOT_TONE_CLASS = {
  neutral: 'bg-semantic-neutral',
  info: 'bg-semantic-info',
  success: 'bg-semantic-success',
  warning: 'bg-semantic-warning',
  destructive: 'bg-semantic-destructive',
  sunken: 'bg-sunken ring-1 ring-border',
} as const satisfies Record<(typeof STATUS_DOT_TONES)[number], string>

export const statusDotVariants = cva('inline-block shrink-0 rounded-full', {
  variants: {
    tone: STATUS_DOT_TONE_CLASS,
    size: {
      sm: 'size-2',
      md: 'size-2.5',
    },
  },
  defaultVariants: {
    tone: 'neutral',
    size: 'sm',
  },
})

export type StatusDotVariantProps = VariantProps<typeof statusDotVariants>
