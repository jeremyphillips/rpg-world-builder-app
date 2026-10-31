import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import {
  REFERENCE_ONLY_EXCERPT_MESSAGE,
  createSourceExcerptRefSchema,
  sourceExcerptRefSchema,
} from './content-provenance'
import { SYSTEM_RULESET_SOURCE_DOCUMENTS } from './source-document-registry'
import { resolveCitation } from './resolve-citation'
import { resolveContentSourceDocumentIds } from './resolve-content-source-documents'
import { resolveSourceExcerptAccess } from './resolve-source-excerpt'
import { sourceCitationSchema, sourceLocatorSchema } from './source-citation'

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

  it('rejects excerpt references for a reference-only document and still allows a citation', () => {
    const documentIdSchema = z.enum(['ref-only', 'srd-5.2.1'])
    const excerptRefSchema = createSourceExcerptRefSchema(documentIdSchema, (documentId) => ({
      storeText: documentId !== 'ref-only',
    }))
    const citationSchema = z.object({
      documentId: documentIdSchema,
      locator: sourceLocatorSchema.optional(),
    })

    expect(
      excerptRefSchema.safeParse({
        documentId: 'ref-only',
        excerptId: 'monsters/mage/protective-magic',
      }).success,
    ).toBe(false)
    expect(
      excerptRefSchema.safeParse({
        documentId: 'ref-only',
        excerptId: 'monsters/mage/protective-magic',
      }).error?.issues[0]?.message,
    ).toBe(REFERENCE_ONLY_EXCERPT_MESSAGE)
    expect(
      citationSchema.safeParse({ documentId: 'ref-only', locator: { page: 42 } }).success,
    ).toBe(true)
    expect(
      sourceExcerptRefSchema.safeParse({
        documentId: 'srd-5.2.1',
        excerptId: 'monsters/mage/protective-magic',
      }).success,
    ).toBe(true)
  })

  it('restricts manager-only source text', () => {
    expect(
      resolveSourceExcerptAccess({
        access: { storeText: true, display: 'managers' },
        isManager: false,
      }),
    ).toBe('restricted')
    expect(
      resolveSourceExcerptAccess({
        access: { storeText: true, display: 'managers' },
        isManager: true,
      }),
    ).toBe('ok')
    expect(
      resolveSourceExcerptAccess({
        access: { storeText: false, display: 'any-viewer' },
        isManager: true,
      }),
    ).toBe('missing')
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
