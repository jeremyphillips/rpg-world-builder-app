import { buildSpellPickerSearchText, type Spell } from '@rpg/contracts'
import { scoreSearchDocument } from '@rpg/search'
import { describe, expect, it } from 'vitest'

import { makeSpell } from '@/test/fixtures/factories/spell'
import { pickSpell } from '@/test/fixtures/pick'

import { assembleSpellPickerSearchDocument } from './spell-picker-search.lib'

const catalogSpells = ['fire-bolt', 'magic-missile', 'hunters-mark'].map((slug) => pickSpell(slug))

const inclusionQueries = [
  '',
  '   ',
  'FIRE BOLT',
  'fire',
  'bolt',
  'firebolt',
  'fire-bolt',
  'evocation',
  'cantrip',
  '1st level',
  'fire',
  "hunter's",
  'hunters',
  'fire bolt evocation',
  'magic missile evocation',
  'nomatchxyz',
]

function legacyCombinedScore(spell: Spell, query: string): number {
  return scoreSearchDocument(
    {
      id: spell.id,
      fields: [{ key: 'combined', text: buildSpellPickerSearchText(spell), role: 'primary' }],
    },
    query,
    { profile: 'forgiving' },
  )
}

function nextScore(spell: Spell, query: string): number {
  return scoreSearchDocument(assembleSpellPickerSearchDocument(spell), query, {
    profile: 'forgiving',
  })
}

describe('spell-picker-search.lib', () => {
  it('assembles one keyword field per structured value and keeps combined as secondary', () => {
    const spell = catalogSpells[0]!
    const document = assembleSpellPickerSearchDocument(spell)
    const roles = Object.fromEntries(document.fields.map((field) => [field.key, field.role]))

    expect(document.id).toBe(spell.id)
    expect(roles.name).toBe('primary')
    expect(roles.school).toBe('keyword')
    expect(roles.description).toBe('secondary')
    expect(roles.combined).toBe('secondary')
    expect(
      document.fields.filter((field) => field.key.startsWith('level:')).length,
    ).toBeGreaterThan(0)
    expect(
      document.fields
        .filter((field) => field.key.startsWith('tag:'))
        .every((field) => field.role === 'keyword'),
    ).toBe(true)
    expect(document.fields.find((field) => field.key === 'combined')?.text).toBe(
      buildSpellPickerSearchText(spell),
    )
    expect(document.fields.some((field) => field.key === 'slug')).toBe(false)
  })

  it('keeps every forgiving combined-field match', () => {
    for (const spell of catalogSpells) {
      for (const query of inclusionQueries) {
        const legacy = legacyCombinedScore(spell, query)
        if (legacy > 0) {
          expect(
            nextScore(spell, query),
            `${spell.name} / ${JSON.stringify(query)}`,
          ).toBeGreaterThan(0)
        }
      }
    }
  })

  it('ranks a literal name substring above a keyword substring and a description-only hit', () => {
    const nameHit = makeSpell({
      slug: 'glasshealing',
      name: 'Glasshealing',
      description: '<p>A quiet light.</p>',
      school: 'abjuration',
      level: 0,
    })
    const keywordHit = makeSpell({
      slug: 'plain-ward',
      name: 'Plain Ward',
      description: '<p>A quiet light.</p>',
      school: 'abjuration',
      level: 0,
      tags: { roles: ['healing'] },
    })
    const descriptionHit = makeSpell({
      slug: 'other-ward',
      name: 'Other Ward',
      description: '<p>The ealin mark fades.</p>',
      school: 'abjuration',
      level: 0,
    })

    const query = 'ealin'
    const nameScore = nextScore(nameHit, query)
    const keywordScore = nextScore(keywordHit, query)
    const descriptionScore = nextScore(descriptionHit, query)

    expect(nameScore).toBeGreaterThan(keywordScore)
    expect(keywordScore).toBeGreaterThan(descriptionScore)
  })

  it('ranks a literal name prefix above a keyword exact match', () => {
    const nameHit = makeSpell({
      slug: 'healing-glass',
      name: 'Healing Glass',
      description: '<p>Light.</p>',
      school: 'abjuration',
      level: 1,
    })
    const keywordHit = makeSpell({
      slug: 'plain-glass',
      name: 'Plain Glass',
      description: '<p>Light.</p>',
      school: 'abjuration',
      level: 1,
      tags: { roles: ['healing'] },
    })

    expect(nextScore(nameHit, 'healing')).toBeGreaterThan(nextScore(keywordHit, 'healing'))
  })

  it('matches separator-insensitive names and lets a literal keyword exact beat a folded name substring', () => {
    const fireBolt = catalogSpells[0]!
    expect(nextScore(fireBolt, 'firebolt')).toBeGreaterThan(0)

    const foldedName = makeSpell({
      slug: 'heal-ing-relic',
      name: 'A Heal Ing Relic',
      description: '<p>Quiet.</p>',
      school: 'abjuration',
      level: 1,
    })
    const keywordExact = makeSpell({
      slug: 'plain-relic',
      name: 'Plain Relic',
      description: '<p>Quiet.</p>',
      school: 'abjuration',
      level: 1,
      tags: { roles: ['healing'] },
    })
    const literalName = makeSpell({
      slug: 'healing-sigil',
      name: 'Healing Sigil',
      description: '<p>Quiet.</p>',
      school: 'abjuration',
      level: 1,
    })

    expect(nextScore(literalName, 'healing')).toBeGreaterThan(nextScore(foldedName, 'healing'))
    expect(nextScore(keywordExact, 'healing')).toBeGreaterThan(nextScore(foldedName, 'healing'))
  })
})
