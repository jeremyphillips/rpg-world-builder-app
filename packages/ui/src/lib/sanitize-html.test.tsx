import { describe, expect, it } from 'vitest'

import { RICH_TEXT_LINK_ATTRS } from './rich-text-link-attrs'
import { sanitizeHtml } from './sanitize-html'

describe('sanitizeHtml', () => {
  it('preserves approved link metadata attributes on anchor tags', () => {
    const html = `<p><a href="/campaigns/demo/spells/fire-bolt" ${RICH_TEXT_LINK_ATTRS.contentType}="spell" ${RICH_TEXT_LINK_ATTRS.contentId}="fire-bolt" ${RICH_TEXT_LINK_ATTRS.contentTitle}="Fire Bolt" ${RICH_TEXT_LINK_ATTRS.linkKind}="detail">Fire Bolt</a></p>`

    const sanitized = sanitizeHtml(html)
    const doc = new DOMParser().parseFromString(sanitized, 'text/html')
    const link = doc.querySelector('a')

    expect(link).not.toBeNull()
    expect(link?.getAttribute('href')).toBe('/campaigns/demo/spells/fire-bolt')
    expect(link?.getAttribute(RICH_TEXT_LINK_ATTRS.contentType)).toBe('spell')
    expect(link?.getAttribute(RICH_TEXT_LINK_ATTRS.contentId)).toBe('fire-bolt')
    expect(link?.getAttribute(RICH_TEXT_LINK_ATTRS.contentTitle)).toBe('Fire Bolt')
    expect(link?.getAttribute(RICH_TEXT_LINK_ATTRS.linkKind)).toBe('detail')
    expect(link?.textContent).toBe('Fire Bolt')
  })

  it('preserves external link target and rel attributes', () => {
    const html =
      '<p><a href="https://example.com/rules" target="_blank" rel="noopener noreferrer">Rules</a></p>'

    const sanitized = sanitizeHtml(html)
    const doc = new DOMParser().parseFromString(sanitized, 'text/html')
    const link = doc.querySelector('a')

    expect(link?.getAttribute('href')).toBe('https://example.com/rules')
    expect(link?.getAttribute('target')).toBe('_blank')
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('strips unapproved data attributes and unsafe markup', () => {
    const html =
      '<p>Safe</p><script>alert("x")</script><a href="javascript:alert(1)" data-evil="yes">Bad</a>'

    const sanitized = sanitizeHtml(html)
    const doc = new DOMParser().parseFromString(sanitized, 'text/html')

    expect(doc.querySelector('script')).toBeNull()
    expect(doc.querySelector('[data-evil]')).toBeNull()
    expect(doc.body.textContent).toContain('Safe')
  })

  it('preserves list markup from the rich-text editor', () => {
    const html = '<ul><li>First</li><li>Second</li></ul><ol><li>One</li></ol>'

    const sanitized = sanitizeHtml(html)
    const doc = new DOMParser().parseFromString(sanitized, 'text/html')

    expect(doc.querySelectorAll('ul li')).toHaveLength(2)
    expect(doc.querySelectorAll('ol li')).toHaveLength(1)
  })
})
