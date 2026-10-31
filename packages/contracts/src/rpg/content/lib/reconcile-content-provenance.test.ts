import { describe, expect, it } from 'vitest'

import {
  ContentProvenanceWriteError,
  reconcileContentProvenance,
  stripContentProvenanceForPatch,
} from './reconcile-content-provenance'

const systemSource = {
  id: 'srd-cc-5.2.1:mage',
  catalogLayer: 'system',
  rulesetId: 'srd-cc-5.2.1',
} as const

describe('reconcileContentProvenance (record)', () => {
  it('rejects client-supplied record provenance in preserve mode', () => {
    expect(() =>
      reconcileContentProvenance({
        authority: 'preserve',
        catalogLayer: 'homebrew',
        rulesetId: 'srd-cc-5.2.1',
        normalized: {
          provenance: {
            documents: [{ kind: 'registered', citation: { documentId: 'srd-5.2.1' } }],
          },
        },
      }),
    ).toThrow(ContentProvenanceWriteError)
  })

  it('reattaches stored provenance when omitted on update', () => {
    const existing = {
      provenance: {
        documents: [{ kind: 'registered', citation: { documentId: 'srd-5.2.1' } }],
        derivedFrom: {
          relation: 'duplicate',
          contentId: 'srd-cc-5.2.1:mage',
          contentTypeKey: 'monsters',
          catalogLayer: 'system',
          at: '2026-01-01T00:00:00.000Z',
        },
      },
    }
    const result = reconcileContentProvenance({
      authority: 'preserve',
      catalogLayer: 'homebrew',
      rulesetId: 'srd-cc-5.2.1',
      normalized: { name: 'Copy' },
      existing,
    })
    expect(result.provenance).toEqual(existing.provenance)
  })

  it('sets duplicate lineage and documents in carry mode', () => {
    const result = reconcileContentProvenance({
      authority: 'carry',
      catalogLayer: 'homebrew',
      rulesetId: 'srd-cc-5.2.1',
      contentTypeKey: 'monsters',
      normalized: { name: 'Mage Copy' },
      provenanceSource: systemSource,
      now: '2026-02-01T00:00:00.000Z',
    })
    const provenance = result.provenance as {
      derivedFrom?: { relation: string; contentId: string }
      documents?: Array<{ citation: { documentId: string } }>
    }
    expect(provenance?.derivedFrom).toMatchObject({
      relation: 'duplicate',
      contentId: 'srd-cc-5.2.1:mage',
      contentTypeKey: 'monsters',
      catalogLayer: 'system',
    })
    expect(provenance?.documents?.[0]?.citation.documentId).toBe('srd-5.2.1')
  })

  it('does not attribute a duplicate of original homebrew to the ruleset', () => {
    const result = reconcileContentProvenance({
      authority: 'carry',
      catalogLayer: 'homebrew',
      rulesetId: 'srd-cc-5.2.1',
      contentTypeKey: 'classes',
      normalized: { name: 'Original Copy' },
      provenanceSource: {
        id: 'homebrew-class',
        catalogLayer: 'homebrew',
        rulesetId: 'srd-cc-5.2.1',
      },
      now: '2026-02-01T00:00:00.000Z',
    })
    const provenance = result.provenance as {
      documents?: unknown
      derivedFrom?: { contentId: string }
    }
    expect(provenance.documents).toBeUndefined()
    expect(provenance.derivedFrom?.contentId).toBe('homebrew-class')
  })

  it('copies documents when duplicating homebrew that already declares them', () => {
    const result = reconcileContentProvenance({
      authority: 'carry',
      catalogLayer: 'homebrew',
      rulesetId: 'srd-cc-5.2.1',
      contentTypeKey: 'monsters',
      normalized: { name: 'Attributed Copy' },
      provenanceSource: {
        id: 'homebrew-mage',
        catalogLayer: 'homebrew',
        rulesetId: 'srd-cc-5.2.1',
        provenance: {
          documents: [{ kind: 'registered', citation: { documentId: 'srd-5.2.1' } }],
        },
      },
      now: '2026-02-01T00:00:00.000Z',
    })
    const provenance = result.provenance as {
      documents?: Array<{ citation: { documentId: string } }>
    }
    expect(provenance.documents?.[0]?.citation.documentId).toBe('srd-5.2.1')
  })
})

const excerpt = {
  documentId: 'srd-5.2.1',
  excerptId: 'monsters/mage/protective-magic',
} as const

const storedReaction = {
  id: 'protective-magic',
  kind: 'spell',
  name: 'Protective Magic',
  provenance: { excerpt },
}

describe('reconcileContentProvenance (entries)', () => {
  const base = {
    authority: 'preserve' as const,
    catalogLayer: 'homebrew' as const,
    rulesetId: 'srd-cc-5.2.1' as const,
    contentTypeKey: 'monsters' as const,
  }

  it('keeps entry provenance when the form omits it', () => {
    const result = reconcileContentProvenance({
      ...base,
      normalized: {
        reactions: [{ id: 'protective-magic', kind: 'spell', name: 'Protective Magic' }],
      },
      existing: { reactions: [storedReaction] },
    })
    expect(result.reactions).toEqual([storedReaction])
  })

  it('keeps provenance across a full reactions replacement and drops removed entries', () => {
    const result = reconcileContentProvenance({
      ...base,
      normalized: {
        reactions: [{ id: 'protective-magic', kind: 'spell', name: 'Renamed' }],
      },
      existing: {
        reactions: [storedReaction, { id: 'gone', kind: 'special', provenance: { excerpt } }],
      },
    })
    expect(result.reactions).toEqual([
      { id: 'protective-magic', kind: 'spell', name: 'Renamed', provenance: { excerpt } },
    ])
  })

  it('leaves a partial update untouched when the host key is absent', () => {
    const result = reconcileContentProvenance({
      ...base,
      normalized: { name: 'Copy' },
      existing: { reactions: [storedReaction] },
    })
    expect(result.reactions).toBeUndefined()
  })

  it('follows an entry moved from actions to bonus actions', () => {
    const result = reconcileContentProvenance({
      ...base,
      normalized: {
        actions: [],
        bonusActions: [{ id: 'protective-magic', kind: 'spell', name: 'Protective Magic' }],
      },
      existing: { actions: [storedReaction], bonusActions: [] },
    })
    const bonusActions = result.bonusActions as Array<{ provenance?: unknown }>
    expect(bonusActions[0]?.provenance).toEqual({ excerpt })
  })

  it('rejects added, replaced, and transferred entry provenance', () => {
    expect(() =>
      reconcileContentProvenance({
        ...base,
        normalized: { reactions: [{ id: 'new', kind: 'special', provenance: { excerpt } }] },
        existing: { reactions: [] },
      }),
    ).toThrow(ContentProvenanceWriteError)

    expect(() =>
      reconcileContentProvenance({
        ...base,
        normalized: {
          reactions: [
            {
              ...storedReaction,
              provenance: { excerpt: { ...excerpt, excerptId: 'monsters/mage/other' } },
            },
          ],
        },
        existing: { reactions: [storedReaction] },
      }),
    ).toThrow(ContentProvenanceWriteError)
  })

  it('strips provenance out of a system patch payload', () => {
    const stripped = stripContentProvenanceForPatch(
      {
        provenance: { citation: { documentId: 'srd-5.2.1' } },
        reactions: [storedReaction],
      },
      'monsters',
    )
    expect(stripped.provenance).toBeUndefined()
    expect(stripped.reactions).toEqual([
      { id: 'protective-magic', kind: 'spell', name: 'Protective Magic' },
    ])
  })

  it('strips system patch provenance and reattaches the seed reference', () => {
    const result = reconcileContentProvenance({
      ...base,
      catalogLayer: 'system',
      normalized: {
        reactions: [
          {
            id: 'protective-magic',
            kind: 'spell',
            name: 'Protective Magic',
            provenance: { excerpt: { ...excerpt, excerptId: 'monsters/mage/other' } },
          },
        ],
      },
      existing: {
        reactions: [storedReaction],
        provenance: { citation: { documentId: 'srd-5.2.1' } },
      },
    })
    expect(result.reactions).toEqual([storedReaction])
    expect(result.provenance).toEqual({ citation: { documentId: 'srd-5.2.1' } })
  })

  it('accepts equal entry provenance when object keys are ordered differently', () => {
    const result = reconcileContentProvenance({
      ...base,
      normalized: {
        reactions: [
          {
            id: 'protective-magic',
            kind: 'spell',
            name: 'Protective Magic',
            provenance: {
              excerpt: { excerptId: excerpt.excerptId, documentId: excerpt.documentId },
            },
          },
        ],
      },
      existing: { reactions: [storedReaction] },
    })
    expect(result.reactions).toEqual([storedReaction])
  })

  it('checks initialize document membership and excerpt existence', () => {
    const normalized = {
      provenance: {
        citation: { documentId: 'srd-5.2.1', locator: { section: 'Monsters', page: 305 } },
      },
      reactions: [storedReaction],
    }
    const initialized = reconcileContentProvenance({
      authority: 'initialize',
      catalogLayer: 'system',
      rulesetId: 'srd-cc-5.2.1',
      contentTypeKey: 'monsters',
      normalized,
      excerptExists: () => true,
    })
    expect(initialized.reactions).toEqual([storedReaction])

    expect(() =>
      reconcileContentProvenance({
        authority: 'initialize',
        catalogLayer: 'system',
        rulesetId: 'srd-cc-5.2.1',
        contentTypeKey: 'monsters',
        normalized,
      }),
    ).toThrow(ContentProvenanceWriteError)

    expect(() =>
      reconcileContentProvenance({
        authority: 'initialize',
        catalogLayer: 'homebrew',
        rulesetId: 'srd-cc-5.2.1',
        contentTypeKey: 'monsters',
        normalized,
        excerptExists: () => true,
      }),
    ).toThrow(/not a source/)

    expect(() =>
      reconcileContentProvenance({
        authority: 'initialize',
        catalogLayer: 'system',
        rulesetId: 'srd-cc-5.2.1',
        contentTypeKey: 'monsters',
        normalized,
        excerptExists: () => false,
      }),
    ).toThrow(/does not exist/)
  })

  it('copies entry provenance in carry mode', () => {
    const result = reconcileContentProvenance({
      authority: 'carry',
      catalogLayer: 'homebrew',
      rulesetId: 'srd-cc-5.2.1',
      contentTypeKey: 'monsters',
      normalized: { name: 'Copy', reactions: [storedReaction] },
      provenanceSource: systemSource,
      now: '2026-02-01T00:00:00.000Z',
    })
    expect(result.reactions).toEqual([storedReaction])
  })
})
