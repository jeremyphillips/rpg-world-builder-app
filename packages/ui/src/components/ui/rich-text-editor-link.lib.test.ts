import { describe, expect, it } from 'vitest'

import { RICH_TEXT_LINK_ATTRS } from '../../lib/rich-text-link-attrs'
import {
  buildLinkMarkAttributes,
  createFallbackLinkContext,
  mergeLinkInsertPayload,
  resolveLinkContextFromAnchor,
  resolveLinkContextFromSelection,
  resolveLinkPickerMode,
} from './rich-text-editor-link.lib'

describe('resolveLinkContextFromSelection', () => {
  it('reads stored metadata attrs from a link mark', () => {
    expect(
      resolveLinkContextFromSelection(
        {
          href: '/campaigns/demo/spells/fire-bolt',
          target: '_blank',
          [RICH_TEXT_LINK_ATTRS.contentType]: 'spell',
          [RICH_TEXT_LINK_ATTRS.contentId]: 'fire-bolt',
          [RICH_TEXT_LINK_ATTRS.contentTitle]: 'Fire Bolt',
          [RICH_TEXT_LINK_ATTRS.linkKind]: 'detail',
        },
        '',
      ),
    ).toEqual({
      href: '/campaigns/demo/spells/fire-bolt',
      displayText: 'Fire Bolt',
      openInNewWindow: true,
      metadata: {
        contentType: 'spell',
        contentId: 'fire-bolt',
        contentTitle: 'Fire Bolt',
        linkKind: 'detail',
      },
    })
  })
})

describe('buildLinkMarkAttributes', () => {
  it('writes metadata attrs and new-window target/rel', () => {
    expect(
      buildLinkMarkAttributes({
        href: 'https://example.com',
        displayText: 'Rules',
        openInNewWindow: true,
        metadata: {
          contentType: 'spell',
          contentId: 'fireball',
          contentTitle: 'Fireball',
          linkKind: 'detail',
        },
      }),
    ).toEqual({
      href: 'https://example.com',
      target: '_blank',
      rel: 'noopener noreferrer',
      [RICH_TEXT_LINK_ATTRS.contentType]: 'spell',
      [RICH_TEXT_LINK_ATTRS.contentId]: 'fireball',
      [RICH_TEXT_LINK_ATTRS.contentTitle]: 'Fireball',
      [RICH_TEXT_LINK_ATTRS.linkKind]: 'detail',
    })
  })
})

describe('createFallbackLinkContext', () => {
  it('treats absolute URLs as external links', () => {
    expect(createFallbackLinkContext('https://example.com', 'Rules')).toEqual({
      href: 'https://example.com',
      displayText: 'Rules',
      openInNewWindow: true,
      metadata: { linkKind: 'external' },
    })
  })
})

describe('mergeLinkInsertPayload', () => {
  it('merges editing metadata with the submitted value', () => {
    expect(
      mergeLinkInsertPayload(
        {
          mode: 'internal',
          href: '/campaigns/demo/spells/fireball',
          displayText: 'Fireball',
          openInNewWindow: false,
          metadata: {
            contentType: 'spell',
            contentId: 'fireball',
            contentTitle: 'Fireball',
            linkKind: 'detail',
          },
        },
        {
          href: '/old',
          displayText: 'Old',
          openInNewWindow: false,
          metadata: { contentTitle: 'Old title' },
        },
      ),
    ).toMatchObject({
      href: '/campaigns/demo/spells/fireball',
      metadata: {
        contentTitle: 'Fireball',
        contentType: 'spell',
        contentId: 'fireball',
        linkKind: 'detail',
      },
    })
  })
})

describe('resolveLinkContextFromAnchor', () => {
  it('reads metadata attrs from rendered anchor elements', () => {
    const anchor = document.createElement('a')
    anchor.setAttribute('href', '/campaigns/demo/content/spells/fireball')
    anchor.textContent = 'Fire Bolt'
    anchor.setAttribute(RICH_TEXT_LINK_ATTRS.contentType, 'spell')
    anchor.setAttribute(RICH_TEXT_LINK_ATTRS.contentId, 'fireball')
    anchor.setAttribute(RICH_TEXT_LINK_ATTRS.contentTitle, 'Fireball')
    anchor.setAttribute(RICH_TEXT_LINK_ATTRS.linkKind, 'detail')

    expect(resolveLinkContextFromAnchor(anchor)).toMatchObject({
      href: '/campaigns/demo/content/spells/fireball',
      displayText: 'Fire Bolt',
      metadata: {
        contentType: 'spell',
        contentId: 'fireball',
        contentTitle: 'Fireball',
        linkKind: 'detail',
      },
    })
  })
})

describe('resolveLinkPickerMode', () => {
  it('opens the external tab for absolute URLs', () => {
    expect(
      resolveLinkPickerMode({
        href: 'https://example.com',
        displayText: 'Rules',
        openInNewWindow: true,
      }),
    ).toBe('external')
  })
})
