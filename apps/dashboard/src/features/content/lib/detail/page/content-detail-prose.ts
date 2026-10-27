import type { RichTextContentVariantProps } from '@rpg/ui'

/** Detail-route rich HTML size contract — tone stays per consumer. */
export const contentDetailProseProps = {
  size: 'sm' satisfies NonNullable<RichTextContentVariantProps['size']>,
} as const
