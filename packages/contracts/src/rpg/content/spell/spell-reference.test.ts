import { describe, expect, it } from 'vitest'

import type { Spell } from './body'
import {
  collectSpellReferenceIssues,
  resolveSpellReference,
  spellReferenceSchema,
} from './spell-reference'

const systemSpell = {
  id: 'srd-cc-5.2.1:counterspell',
  status: 'published',
} as Spell

const draftSpell = {
  id: 'srd-cc-5.2.1:draft-spell',
  status: 'draft',
} as Spell

const hiddenSpell = {
  id: 'srd-cc-5.2.1:hidden',
  status: 'published',
  campaignAccess: { available: false },
} as unknown as Spell

const homebrewSpell = {
  id: '665f0c2a9b1e4c0011223344',
  status: 'published',
} as Spell

const spellsById = new Map(
  [systemSpell, draftSpell, hiddenSpell, homebrewSpell].map((spell) => [spell.id, spell]),
)

describe('resolveSpellReference', () => {
  it('resolves exact content ids and nothing else', () => {
    expect(resolveSpellReference(systemSpell.id, spellsById)).toBe(systemSpell)
    expect(resolveSpellReference(homebrewSpell.id, spellsById)).toBe(homebrewSpell)
    expect(resolveSpellReference('counterspell', spellsById)).toBeUndefined()
    expect(resolveSpellReference('missing', spellsById)).toBeUndefined()
    expect(spellReferenceSchema.parse(systemSpell.id)).toBe(systemSpell.id)
  })
})

describe('collectSpellReferenceIssues', () => {
  const refs = [
    { path: 'grantGroups.0.grants.0.spellIds.0', spellId: 'missing' },
    { path: 'grantGroups.0.grants.1.spellIds.0', spellId: draftSpell.id },
    { path: 'grantGroups.0.grants.2.spellIds.0', spellId: hiddenSpell.id },
  ]

  it('reports unknown ids on both intents and draft spells only on publish', () => {
    const draftIssues = collectSpellReferenceIssues({
      refs,
      spellsById,
      catalogStatus: 'ready',
      intent: 'draft',
    })
    expect(draftIssues.map((issue) => issue.code)).toEqual(['unknown_spell'])

    const publishIssues = collectSpellReferenceIssues({
      refs,
      spellsById,
      catalogStatus: 'ready',
      intent: 'publish',
    })
    expect(publishIssues.map((issue) => issue.code)).toEqual([
      'unknown_spell',
      'spell_not_referenceable',
    ])
  })

  it('reports an unavailable catalog only on publish', () => {
    expect(
      collectSpellReferenceIssues({
        refs: [{ path: 'spellIds.0', spellId: systemSpell.id }],
        spellsById,
        catalogStatus: 'unavailable',
        intent: 'draft',
      }),
    ).toEqual([])
    expect(
      collectSpellReferenceIssues({
        refs: [{ path: 'spellIds.0', spellId: systemSpell.id }],
        spellsById,
        catalogStatus: 'unavailable',
        intent: 'publish',
      }).map((issue) => issue.code),
    ).toEqual(['spell_catalog_unavailable'])
  })
})
