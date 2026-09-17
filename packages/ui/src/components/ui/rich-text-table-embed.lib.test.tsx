import { describe, expect, it } from 'vitest'

import { RICH_TEXT_TABLE_EMBED_ATTR } from '../../lib/rich-text-table-embed-attrs'
import { extractTableEmbedIds, richTextHtmlHasTableEmbeds } from './rich-text-table-embed.lib'
import { normalizeRichTextHtml } from './rich-text-html'

describe('extractTableEmbedIds', () => {
  it('finds embed ids from nested markup without regex splitting', () => {
    const html = `<ul><li>Before</li></ul><div ${RICH_TEXT_TABLE_EMBED_ATTR}="reincarnate-species"></div><p>After</p>`
    expect(extractTableEmbedIds(html)).toEqual(['reincarnate-species'])
  })

  it('returns duplicate ids when the same table is referenced twice', () => {
    const html = `<div ${RICH_TEXT_TABLE_EMBED_ATTR}="a"></div><div ${RICH_TEXT_TABLE_EMBED_ATTR}="a"></div>`
    expect(extractTableEmbedIds(html)).toEqual(['a', 'a'])
  })
})

describe('richTextHtmlHasTableEmbeds', () => {
  it('treats embed-only HTML as non-empty for normalization', () => {
    const html = `<div ${RICH_TEXT_TABLE_EMBED_ATTR}="table-1"></div>`
    expect(richTextHtmlHasTableEmbeds(html)).toBe(true)
    expect(normalizeRichTextHtml(html)).toBe(html)
  })
})
