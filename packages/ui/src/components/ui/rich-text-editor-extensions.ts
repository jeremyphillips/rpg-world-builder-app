import type { Extensions } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { RichTextLink } from './rich-text-link-extension'
import { RichTextTableEmbed } from './rich-text-table-embed-extension'

export interface RichTextEditorExtensionOptions {
  linkable: boolean
  codeBlocks: boolean
  tables: boolean
}

export function createRichTextEditorExtensions({
  linkable,
  codeBlocks,
  tables,
}: RichTextEditorExtensionOptions): Extensions {
  return [
    StarterKit.configure({
      link: false,
      code: codeBlocks ? undefined : false,
      codeBlock: codeBlocks ? undefined : false,
    }),
    ...(linkable ? [RichTextLink.configure({ openOnClick: false })] : []),
    ...(tables ? [RichTextTableEmbed] : []),
  ]
}
