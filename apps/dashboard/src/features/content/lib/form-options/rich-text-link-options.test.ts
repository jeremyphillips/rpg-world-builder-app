import { describe, expect, it } from 'vitest'

import { pickFeat, pickSpell } from '../fixtures/pick'
import {
  RICH_TEXT_LINK_CONTENT_TYPE_OPTIONS,
  buildRichTextInternalLinkOptions,
} from './rich-text-link-options'

describe('RICH_TEXT_LINK_CONTENT_TYPE_OPTIONS', () => {
  it('includes the supported spell and feat content types', () => {
    expect(RICH_TEXT_LINK_CONTENT_TYPE_OPTIONS).toEqual([
      { value: 'spell', label: 'Spells' },
      { value: 'feat', label: 'Feats' },
    ])
  })
})

describe('buildRichTextInternalLinkOptions', () => {
  it('includes overview options and detail options with canonical hrefs', () => {
    const campaignId = 'campaign-123'
    const fireBolt = pickSpell('fire-bolt')
    const alert = pickFeat('alert')

    const options = buildRichTextInternalLinkOptions({
      campaignId,
      entitiesByType: {
        spell: [fireBolt],
        feat: [alert],
      },
    })

    expect(options).toContainEqual({
      id: '__spell_overview__',
      title: 'Spell Overview',
      href: `/campaigns/${campaignId}/spells`,
      contentType: 'spell',
      kind: 'overview',
    })
    expect(options).toContainEqual({
      id: '__feat_overview__',
      title: 'Feat Overview',
      href: `/campaigns/${campaignId}/feats`,
      contentType: 'feat',
      kind: 'overview',
    })
    expect(options).toContainEqual({
      id: fireBolt.slug,
      title: fireBolt.name,
      href: `/campaigns/${campaignId}/spells/${fireBolt.slug}`,
      contentType: 'spell',
      kind: 'detail',
    })
    expect(options).toContainEqual({
      id: alert.slug,
      title: alert.name,
      href: `/campaigns/${campaignId}/feats/${alert.slug}`,
      contentType: 'feat',
      kind: 'detail',
    })
  })

  it('marks homebrew detail options with a source label', () => {
    const campaignId = 'campaign-123'
    const homebrewSpell = { ...pickSpell('fire-bolt'), source: 'homebrew' as const }
    const homebrewFeat = { ...pickFeat('alert'), source: 'homebrew' as const }

    const options = buildRichTextInternalLinkOptions({
      campaignId,
      entitiesByType: {
        spell: [homebrewSpell],
        feat: [homebrewFeat],
      },
    })

    expect(
      options.find((option) => option.contentType === 'spell' && option.kind === 'detail')
        ?.sourceLabel,
    ).toBe('Homebrew')
    expect(
      options.find((option) => option.contentType === 'feat' && option.kind === 'detail')
        ?.sourceLabel,
    ).toBe('Homebrew')
  })
})
