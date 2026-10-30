import { describe, expect, it } from 'vitest'

import {
  ContentProvenanceWriteError,
  reconcileContentProvenance,
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
})
