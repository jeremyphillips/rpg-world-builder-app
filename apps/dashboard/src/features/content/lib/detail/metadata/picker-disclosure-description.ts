import type { RichTextContentVariantProps } from '@rpg/ui'

/**
 * Description under metadata in picker disclosure panels.
 * `sm` is `prose-sm` / `text-sm` (14px).
 */
export const PICKER_DISCLOSURE_DESCRIPTION_SIZE = 'sm' as const satisfies NonNullable<
  RichTextContentVariantProps['size']
>
