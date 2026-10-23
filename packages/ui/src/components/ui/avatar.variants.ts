import { cva, type VariantProps } from 'class-variance-authority'

export const AVATAR_SIZES = ['sm', 'md', 'lg'] as const

export type AvatarSize = (typeof AVATAR_SIZES)[number]

export const UI_AVATAR_SIZE_CLASSES = AVATAR_SIZES.map((size) => `ui-avatar--${size}` as const)

export const avatarVariants = cva('ui-avatar', {
  variants: {
    size: {
      sm: 'ui-avatar--sm',
      md: 'ui-avatar--md',
      lg: 'ui-avatar--lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

export type AvatarVariantProps = VariantProps<typeof avatarVariants>
