import { z } from 'zod'

import type { SystemRulesetId } from '../ruleset'
import type { SourceDocumentAccess, SourceDocumentLicense } from './source-document-access'

export type SourceDocumentEntry = {
  label: string
  description: string
  publisher: string
  revision: string
  url: string
  license: SourceDocumentLicense
  access: SourceDocumentAccess
  attributionStatement: string
}

export const SOURCE_DOCUMENT_ENTRIES = {
  'srd-5.2.1': {
    label: 'System Reference Document 5.2.1',
    description: 'Wizards of the Coast System Reference Document 5.2.1, licensed under CC-BY-4.0.',
    publisher: 'Wizards of the Coast LLC',
    revision: '5.2.1',
    url: 'https://www.dndbeyond.com/srd',
    license: 'cc-by-4.0',
    access: { storeText: true, display: 'any-viewer', export: 'with-attribution' },
    attributionStatement:
      'This work includes material from the System Reference Document 5.2.1 by Wizards of the Coast LLC and available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.',
  },
} as const satisfies Record<string, SourceDocumentEntry>

export const SOURCE_DOCUMENT_IDS = Object.keys(SOURCE_DOCUMENT_ENTRIES) as Array<
  keyof typeof SOURCE_DOCUMENT_ENTRIES
>

export type SourceDocumentId = keyof typeof SOURCE_DOCUMENT_ENTRIES

export const sourceDocumentIdSchema = z.enum(
  SOURCE_DOCUMENT_IDS as [SourceDocumentId, ...SourceDocumentId[]],
)

export const SYSTEM_RULESET_SOURCE_DOCUMENTS = {
  'srd-cc-5.2.1': ['srd-5.2.1'],
} as const satisfies Record<SystemRulesetId, readonly SourceDocumentId[]>

export function getRegisteredSourceDocument(documentId: SourceDocumentId): SourceDocumentEntry {
  return SOURCE_DOCUMENT_ENTRIES[documentId]
}

export function listRulesetSourceDocumentIds(
  rulesetId: SystemRulesetId,
): readonly SourceDocumentId[] {
  return SYSTEM_RULESET_SOURCE_DOCUMENTS[rulesetId]
}
