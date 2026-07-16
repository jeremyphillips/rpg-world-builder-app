import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { fieldDigitWidthVariants } from './field-digit-metrics'
import { fieldControlSizeClasses } from './field-sizing.variants'

/** Read-only field value — matches select trigger height and type scale without affordances. */
export const fieldReadOnlyValueVariants = cva(
  'inline-flex shrink-0 select-none items-center text-foreground',
  {
    variants: {
      size: fieldControlSizeClasses,
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type FieldReadOnlyValueVariantProps = VariantProps<typeof fieldReadOnlyValueVariants>

export function fieldReadOnlyValueDigitWidthClass(
  size: NonNullable<FieldReadOnlyValueVariantProps['size']>,
  digits: keyof (typeof fieldDigitWidthVariants)['md'],
): string {
  return fieldDigitWidthVariants[size][digits]
}

export function fieldReadOnlyValueClassName({
  size = 'md',
  digits,
  className,
}: FieldReadOnlyValueVariantProps & {
  digits?: keyof (typeof fieldDigitWidthVariants)['md']
  className?: string
}): string {
  return cn(
    fieldReadOnlyValueVariants({ size }),
    digits != null ? fieldDigitWidthVariants[size ?? 'md'][digits] : undefined,
    className,
  )
}
