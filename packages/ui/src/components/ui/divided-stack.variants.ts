import { cva, type VariantProps } from 'class-variance-authority'

export const DIVIDED_STACK_DENSITIES = ['compact', 'comfortable', 'spacious'] as const

export type DividedStackDensity = (typeof DIVIDED_STACK_DENSITIES)[number]

/** Vertical stack with structural borders between direct DOM siblings. */
export const dividedStackVariants = cva(
  'flex min-w-0 w-full flex-col [&>*+*]:border-t [&>*+*]:border-border-subtle',
  {
    variants: {
      density: {
        compact: '[&>*+*]:mt-2 [&>*+*]:pt-2',
        comfortable: '[&>*+*]:mt-4 [&>*+*]:pt-4',
        spacious: '[&>*+*]:mt-4 [&>*+*]:pt-4',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
)

export type DividedStackVariantProps = VariantProps<typeof dividedStackVariants>
