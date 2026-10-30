import { describe, expect, it } from 'vitest'

import { SYSTEM_RULESET_SOURCE_DOCUMENTS } from './source-document-registry'
import { resolveCitation } from './resolve-citation'
import { resolveContentSourceDocumentIds } from './resolve-content-source-documents'
import { sourceCitationSchema } from './source-citation'

describe('source document registry', () => {
  it('maps the shipped ruleset to SRD 5.2.1', () => {
    expect(SYSTEM_RULESET_SOURCE_DOCUMENTS['srd-cc-5.2.1']).toEqual(['srd-5.2.1'])
  })
})

describe('resolveCitation', () => {
  it('resolves SRD attribution and an optional locator', () => {
    const citation = sourceCitationSchema.parse({
      documentId: 'srd-5.2.1',
      locator: { section: 'Monsters', page: 42 },
    })
    const resolved = resolveCitation(citation)
    expect(resolved.documentId).toBe('srd-5.2.1')
    expect(resolved.document.label).toContain('System Reference Document')
    expect(resolved.locator?.page).toBe(42)
  })
})

describe('resolveContentSourceDocumentIds', () => {
  it('uses ruleset documents for system records', () => {
    expect(
      resolveContentSourceDocumentIds({
        catalogLayer: 'system',
        rulesetId: 'srd-cc-5.2.1',
      }),
    ).toEqual(['srd-5.2.1'])
  })

  it('uses homebrew provenance documents when present', () => {
    expect(
      resolveContentSourceDocumentIds({
        catalogLayer: 'homebrew',
        rulesetId: 'srd-cc-5.2.1',
        provenance: {
          documents: [{ kind: 'registered', citation: { documentId: 'srd-5.2.1' } }],
        },
      }),
    ).toEqual(['srd-5.2.1'])
  })
})
