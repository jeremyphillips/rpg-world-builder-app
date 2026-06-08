import { cva, type VariantProps } from 'class-variance-authority'

export const avatarVariants = cva(
  'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground',
  {
    variants: {
      size: {
        sm: 'size-7 text-xs',
        md: 'size-9 text-sm',
        lg: 'size-11 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type AvatarVariantProps = VariantProps<typeof avatarVariants>
