import { z } from 'zod'

import { keysFromEntries, vocabEnumFromEntries } from '../../vocab/enum-schema'
import type { GameTermEntry } from '../../vocab/types'

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

export const SOURCE_DOCUMENT_LICENSE_ENTRIES = {
  'cc-by-4.0': {
    label: 'CC-BY-4.0',
    description: 'Creative Commons Attribution 4.0 International License.',
  },
} as const satisfies Record<string, GameTermEntry>

export const SOURCE_DOCUMENT_LICENSE_KEYS = keysFromEntries(SOURCE_DOCUMENT_LICENSE_ENTRIES)

export const sourceDocumentLicenseSchema = vocabEnumFromEntries(SOURCE_DOCUMENT_LICENSE_ENTRIES)
