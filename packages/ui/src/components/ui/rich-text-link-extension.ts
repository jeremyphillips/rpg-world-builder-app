import Link from '@tiptap/extension-link'

import { RICH_TEXT_LINK_ATTRS } from '../../lib/rich-text-link-attrs'

function richTextDataAttribute(name: string) {
  return {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute(name),
    renderHTML: (attributes: Record<string, unknown>) => {
      const value = attributes[name]
      if (typeof value !== 'string' || value.length === 0) return {}
      return { [name]: value }
    },
  }
}

/** TipTap link mark that round-trips rich-text picker metadata attributes. */
export const RichTextLink = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      [RICH_TEXT_LINK_ATTRS.contentType]: richTextDataAttribute(RICH_TEXT_LINK_ATTRS.contentType),
      [RICH_TEXT_LINK_ATTRS.contentId]: richTextDataAttribute(RICH_TEXT_LINK_ATTRS.contentId),
      [RICH_TEXT_LINK_ATTRS.contentTitle]: richTextDataAttribute(RICH_TEXT_LINK_ATTRS.contentTitle),
      [RICH_TEXT_LINK_ATTRS.linkKind]: richTextDataAttribute(RICH_TEXT_LINK_ATTRS.linkKind),
    }
  },
})
