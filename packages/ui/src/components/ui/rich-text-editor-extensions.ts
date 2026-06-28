import type { Extensions } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { RichTextLink } from './rich-text-link-extension'

export interface RichTextEditorExtensionOptions {
  linkable: boolean
  codeBlocks: boolean
}

export function createRichTextEditorExtensions({
  linkable,
  codeBlocks,
}: RichTextEditorExtensionOptions): Extensions {
  return [
    StarterKit.configure({
      link: false,
      code: codeBlocks ? undefined : false,
      codeBlock: codeBlocks ? undefined : false,
    }),
    ...(linkable ? [RichTextLink.configure({ openOnClick: false })] : []),
  ]
}
