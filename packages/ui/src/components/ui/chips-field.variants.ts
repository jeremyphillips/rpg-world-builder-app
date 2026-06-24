import { cva, type VariantProps } from 'class-variance-authority'

export const chipPillVariants = cva(
  [
    'inline-flex items-center rounded-full border font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      size: {
        sm: 'px-2.5 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
)

export type ChipPillVariantProps = VariantProps<typeof chipPillVariants>
