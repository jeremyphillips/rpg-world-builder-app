import { describe, expect, it } from 'vitest'

import type { Spell } from './body'
import {
  createSpellCatalogContext,
  SPELL_REFERENCE_DISPLAY_MESSAGES,
} from './spell-catalog-context'
import {
  collectSpellReferenceIssues,
  presentSpellReferenceDisplayName,
  resolveSpellReference,
  resolveSpellReferenceOutcome,
  resolveSpellReferenceOutcomeForCatalogStatus,
  resolveSpellReferenceOutcomes,
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

const spellA = {
  id: 'srd-cc-5.2.1:fire-bolt',
  name: 'Fire Bolt',
  level: 0,
} as Spell

const spellB = {
  id: 'homebrew:fire-bolt',
  name: 'Homebrew Fire Bolt',
  level: 0,
} as Spell

const collisionCatalog = createSpellCatalogContext({
  status: 'ready',
  spellsById: new Map([
    [spellA.id, spellA],
    [spellB.id, spellB],
  ]),
})

describe('resolveSpellReferenceOutcome', () => {
  it('scenario A: colliding local slugs resolve only by exact canonical id', () => {
    expect(resolveSpellReferenceOutcome(spellA.id, collisionCatalog)).toEqual({
      status: 'resolved',
      spellId: spellA.id,
      spell: spellA,
    })
    expect(resolveSpellReferenceOutcome(spellB.id, collisionCatalog)).toEqual({
      status: 'resolved',
      spellId: spellB.id,
      spell: spellB,
    })
    expect(resolveSpellReferenceOutcome('fire-bolt', collisionCatalog)).toEqual({
      status: 'unresolved',
      spellId: 'fire-bolt',
      reason: 'unknown-spell',
    })
  })

  it('scenario C: loading catalog yields catalog-loading, not unknown-spell', () => {
    const loading = createSpellCatalogContext({ status: 'pending', spellsById })
    expect(resolveSpellReferenceOutcome(systemSpell.id, loading)).toEqual({
      status: 'unresolved',
      spellId: systemSpell.id,
      reason: 'catalog-loading',
    })
    expect(
      presentSpellReferenceDisplayName(resolveSpellReferenceOutcome(systemSpell.id, loading)),
    ).toBe(SPELL_REFERENCE_DISPLAY_MESSAGES.catalogLoading)
  })

  it('scenario D: error catalog yields catalog-error', () => {
    const errored = createSpellCatalogContext({ status: 'error', spellsById })
    const erroredOutcome = resolveSpellReferenceOutcome(systemSpell.id, errored)
    expect(erroredOutcome.status === 'unresolved' && erroredOutcome.reason).toBe('catalog-error')
  })

  it('scenario E: ready catalog with absent id yields unknown-spell', () => {
    const ready = createSpellCatalogContext({ status: 'ready', spellsById })
    const outcome = resolveSpellReferenceOutcome('missing-id', ready)
    expect(outcome).toEqual({
      status: 'unresolved',
      spellId: 'missing-id',
      reason: 'unknown-spell',
    })
    expect(presentSpellReferenceDisplayName(outcome)).toBe(
      SPELL_REFERENCE_DISPLAY_MESSAGES.unknownSpell,
    )
  })

  it('scenario F: binary catalog status maps unavailable without unknown-spell', () => {
    const unavailable = resolveSpellReferenceOutcomeForCatalogStatus(systemSpell.id, {
      catalogStatus: 'unavailable',
      spellsById,
    })
    expect(unavailable).toEqual({
      status: 'unresolved',
      spellId: systemSpell.id,
      reason: 'catalog-unavailable',
    })
  })

  it('resolveSpellReferenceOutcomes preserves order', () => {
    const ready = createSpellCatalogContext({ status: 'ready', spellsById })
    const outcomes = resolveSpellReferenceOutcomes([systemSpell.id, 'missing-id'], ready)
    expect(outcomes).toHaveLength(2)
    expect(outcomes[0]?.status).toBe('resolved')
    expect(outcomes[1]?.status === 'unresolved' && outcomes[1].reason).toBe('unknown-spell')
  })
})

describe('collectSpellReferenceIssues', () => {
  const refs = [
    { path: 'grantGroups.0.grants.0.spellIds.0', spellId: 'missing' },
    { path: 'grantGroups.0.grants.1.spellIds.0', spellId: draftSpell.id },
    { path: 'grantGroups.0.grants.2.spellIds.0', spellId: hiddenSpell.id },
  ]

  it('reports unresolved overlay targets separately from unknown spells', () => {
    expect(
      collectSpellReferenceIssues({
        refs: [{ path: 'spellIds.0', spellId: 'srd:broken' }],
        spellsById,
        catalogStatus: 'ready',
        intent: 'publish',
        unresolvedOverlayTargetIds: new Set(['srd:broken']),
      }),
    ).toEqual([
      {
        path: 'spellIds.0',
        code: 'unresolved_overlay_spell',
        message: 'This spell exists in the catalog but its overlay could not be applied.',
      },
    ])
  })

  it('reports unknown ids on both intents and draft spells only on publish', () => {
    expect(
      collectSpellReferenceIssues({
        refs,
        spellsById,
        catalogStatus: 'ready',
        intent: 'draft',
      }),
    ).toEqual([
      {
        path: 'grantGroups.0.grants.0.spellIds.0',
        code: 'unknown_spell',
        message: 'Choose a spell from the catalog.',
      },
    ])

    expect(
      collectSpellReferenceIssues({
        refs,
        spellsById,
        catalogStatus: 'ready',
        intent: 'publish',
      }),
    ).toEqual([
      {
        path: 'grantGroups.0.grants.0.spellIds.0',
        code: 'unknown_spell',
        message: 'Choose a spell from the catalog.',
      },
      {
        path: 'grantGroups.0.grants.1.spellIds.0',
        code: 'spell_not_referenceable',
        message: 'Draft spells cannot be referenced on published content.',
      },
    ])
  })

  it('reports an unavailable catalog only on publish, once per ref', () => {
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
        refs: [
          { path: 'spellIds.0', spellId: systemSpell.id },
          { path: 'spellIds.1', spellId: draftSpell.id },
        ],
        spellsById,
        catalogStatus: 'unavailable',
        intent: 'publish',
      }),
    ).toEqual([
      {
        path: 'spellIds.0',
        code: 'spell_catalog_unavailable',
        message: 'The spell catalog is unavailable, so this reference cannot be checked.',
      },
      {
        path: 'spellIds.1',
        code: 'spell_catalog_unavailable',
        message: 'The spell catalog is unavailable, so this reference cannot be checked.',
      },
    ])
    expect(
      collectSpellReferenceIssues({
        refs: [],
        spellsById,
        catalogStatus: 'unavailable',
        intent: 'publish',
      }),
    ).toEqual([])
  })
})
