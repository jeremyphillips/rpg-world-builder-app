import { describe, expect, it } from 'vitest'

import { optionMatchesQuery } from '../components/ui/option-query.lib'
import { filterInternalLinkOptions } from '../components/ui/rich-text-link-picker.lib'
import { RICH_TEXT_LINK_CONTENT_TYPE_FILTER_ALL } from '../components/ui/rich-text-link-picker.lib'
import type { RichTextLinkPickerInternalOption } from '../components/ui/rich-text-link-picker.types'
import {
  matchTier,
  rankItems,
  scoreField,
  scoreItem,
  type SearchableItem,
  type WeightedSearchField,
} from './search'

const linkOptions: RichTextLinkPickerInternalOption[] = [
  {
    id: 'spell-overview',
    title: 'Spell Overview',
    href: '/campaigns/demo/content/spells',
    contentType: 'spell',
    kind: 'overview',
  },
  {
    id: 'fireball',
    title: 'Fireball',
    href: '/campaigns/demo/content/spells/fireball',
    contentType: 'spell',
    kind: 'detail',
    sourceLabel: 'Homebrew',
  },
  {
    id: 'sharpshooter',
    title: 'Sharpshooter',
    href: '/campaigns/demo/content/feats/sharpshooter',
    contentType: 'feat',
    kind: 'detail',
  },
]

function item(fields: WeightedSearchField[]): SearchableItem {
  return { fields }
}

describe('matchTier', () => {
  it('classifies exact, prefix, substring, and none', () => {
    expect(matchTier('Fireball', 'fireball')).toBe('exact')
    expect(matchTier('Fireball', 'fire')).toBe('prefix')
    expect(matchTier('Fireball', 'ball')).toBe('substring')
    expect(matchTier('Fireball', 'ice')).toBe('none')
    expect(matchTier('Fireball', '   ')).toBe('none')
  })
})

describe('scoreField', () => {
  it('applies role tier base scores', () => {
    expect(scoreField({ text: 'Fireball', weight: 1, role: 'label' }, 'fire')).toBe(100)
    expect(scoreField({ text: 'Fireball', weight: 1, role: 'label' }, 'ball')).toBe(80)
    expect(scoreField({ text: 'fire-bolt', weight: 1, role: 'alias' }, 'fire-bolt')).toBe(70)
    expect(scoreField({ text: 'fire-bolt', weight: 1, role: 'alias' }, 'bolt')).toBe(55)
    expect(scoreField({ text: 'innate', weight: 1, role: 'keyword' }, 'inn')).toBe(35)
    expect(scoreField({ text: 'innate', weight: 1, role: 'keyword' }, 'ate')).toBe(28)
    expect(scoreField({ text: 'Homebrew source', weight: 1, role: 'description' }, 'brew')).toBe(10)
    expect(scoreField({ text: 'Proficiencies', weight: 1, role: 'group' }, 'prof')).toBe(5)
  })

  it('multiplies by field weight', () => {
    expect(scoreField({ text: 'Darkvision', weight: 0.8, role: 'label' }, 'dark')).toBe(80)
  })

  it('ignores unsupported tiers for a role', () => {
    expect(scoreField({ text: 'Homebrew', weight: 1, role: 'description' }, 'home')).toBe(10)
    expect(scoreField({ text: 'Homebrew', weight: 1, role: 'group' }, 'home')).toBe(5)
    expect(scoreField({ text: 'Homebrew', weight: 1, role: 'description' }, 'brew')).toBe(10)
  })
})

describe('scoreItem', () => {
  it('returns the max field score', () => {
    expect(
      scoreItem(
        item([
          { text: 'Spells', weight: 1, role: 'label' },
          { text: 'innate', weight: 1, role: 'keyword' },
        ]),
        'spell',
      ),
    ).toBe(100)
  })
})

describe('rankItems', () => {
  const items = [
    item([{ text: 'Movement bonus', weight: 1, role: 'label' }]),
    item([
      { text: 'Skill proficiency', weight: 1, role: 'label' },
      { text: 'athletics', weight: 1, role: 'keyword' },
    ]),
    item([{ text: 'Language', weight: 1, role: 'label' }]),
  ]

  it('returns all items for an empty query', () => {
    expect(rankItems(items, '')).toEqual(items)
  })

  it('sorts by score descending and preserves input order for ties', () => {
    const ranked = rankItems(
      [
        item([{ text: 'Alpha', weight: 1, role: 'label' }]),
        item([{ text: 'Beta', weight: 1, role: 'label' }]),
        item([{ text: 'Gamma', weight: 1, role: 'label' }]),
      ],
      'a',
    )

    expect(ranked.map((entry) => entry.fields[0]?.text)).toEqual(['Alpha', 'Beta', 'Gamma'])
  })

  it('ranks label prefix above keyword substring', () => {
    const ranked = rankItems(items, 'skill')
    expect(ranked[0]?.fields[0]?.text).toBe('Skill proficiency')
  })
})

describe('optionMatchesQuery wrapper', () => {
  it('matches label, value, and description substrings', () => {
    const option = { value: 'fire-bolt', label: 'Fire Bolt', description: 'Cantrip' }
    expect(optionMatchesQuery(option, '')).toBe(true)
    expect(optionMatchesQuery(option, 'bolt')).toBe(true)
    expect(optionMatchesQuery(option, 'fire-bolt')).toBe(true)
    expect(optionMatchesQuery(option, 'cantrip')).toBe(true)
    expect(optionMatchesQuery(option, 'ice')).toBe(false)
  })
})

describe('filterInternalLinkOptions wrapper', () => {
  it('preserves content-type pre-filtering', () => {
    expect(filterInternalLinkOptions(linkOptions, 'spell', '')).toHaveLength(2)
    expect(filterInternalLinkOptions(linkOptions, 'feat', '')).toHaveLength(1)
    expect(
      filterInternalLinkOptions(linkOptions, RICH_TEXT_LINK_CONTENT_TYPE_FILTER_ALL, ''),
    ).toHaveLength(3)
  })

  it('matches title, source label, and href substrings', () => {
    expect(
      filterInternalLinkOptions(linkOptions, RICH_TEXT_LINK_CONTENT_TYPE_FILTER_ALL, 'homebrew'),
    ).toEqual([linkOptions[1]])
    expect(
      filterInternalLinkOptions(linkOptions, RICH_TEXT_LINK_CONTENT_TYPE_FILTER_ALL, 'fireball'),
    ).toEqual([linkOptions[1]])
    expect(
      filterInternalLinkOptions(linkOptions, RICH_TEXT_LINK_CONTENT_TYPE_FILTER_ALL, '/feats/'),
    ).toEqual([linkOptions[2]])
  })
})
