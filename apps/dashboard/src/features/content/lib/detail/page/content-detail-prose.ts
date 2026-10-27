import type { RichTextContentVariantProps } from '@rpg/ui'

/** Catalog detail rich HTML. Size is `sm`; tone stays the `RichTextContent` default. */
export const contentDetailProseProps = {
  size: 'sm' satisfies NonNullable<RichTextContentVariantProps['size']>,
} as const
