import { z } from 'zod'

import { keysFromEntries, vocabEnumFromEntries } from '../../vocab/enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../../vocab/types'

export const SOURCE_DOCUMENT_DISPLAY_TERM = {
  label: 'Source document display',
  description:
    'Who may see stored source text for a registered document, on top of record visibility.',
  sentence: {
    singular: 'source document display',
    plural: 'source document displays',
  },
} as const satisfies VocabularyTerm

export const SOURCE_DOCUMENT_DISPLAY_ENTRIES = {
  'any-viewer': {
    label: 'Any viewer',
    description: 'Stored source text may be shown to any viewer who can read the record.',
  },
  managers: {
    label: 'Campaign managers',
    description: 'Stored source text is limited to campaign managers on top of record visibility.',
  },
} as const satisfies Record<string, GameTermEntry>

export const sourceDocumentDisplaySchema = vocabEnumFromEntries(SOURCE_DOCUMENT_DISPLAY_ENTRIES)

export const SOURCE_DOCUMENT_EXPORT_TERM = {
  label: 'Source document export',
  description: 'Whether stored source text from a registered document may appear in exports.',
  sentence: {
    singular: 'source document export',
    plural: 'source document exports',
  },
} as const satisfies VocabularyTerm

export const SOURCE_DOCUMENT_EXPORT_ENTRIES = {
  'with-attribution': {
    label: 'With attribution',
    description: 'Exports may include stored text when attribution requirements are met.',
  },
  never: {
    label: 'Never',
    description: 'Stored text must not appear in exports.',
  },
} as const satisfies Record<string, GameTermEntry>

export const sourceDocumentExportSchema = vocabEnumFromEntries(SOURCE_DOCUMENT_EXPORT_ENTRIES)

export const sourceDocumentAccessSchema = z.object({
  storeText: z.boolean(),
  display: sourceDocumentDisplaySchema,
  export: sourceDocumentExportSchema,
})

export type SourceDocumentAccess = z.infer<typeof sourceDocumentAccessSchema>

export const SOURCE_DOCUMENT_LICENSE_TERM = {
  label: 'Source document license',
  description: 'The license that governs a registered source document.',
  sentence: {
    singular: 'source document license',
    plural: 'source document licenses',
  },
} as const satisfies VocabularyTerm

export const SOURCE_DOCUMENT_LICENSE_ENTRIES = {
  'cc-by-4.0': {
    label: 'CC-BY-4.0',
    description: 'Creative Commons Attribution 4.0 International License.',
  },
} as const satisfies Record<string, GameTermEntry>

export const SOURCE_DOCUMENT_LICENSE_KEYS = keysFromEntries(SOURCE_DOCUMENT_LICENSE_ENTRIES)

export const sourceDocumentLicenseSchema = vocabEnumFromEntries(SOURCE_DOCUMENT_LICENSE_ENTRIES)

export type SourceDocumentLicense = z.infer<typeof sourceDocumentLicenseSchema>
