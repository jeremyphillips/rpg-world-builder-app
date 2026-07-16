import { z } from 'zod'

// ---------------------------------------------------------------------------
// Source field dispositions — classify extraction outcomes before local mapping.
// ---------------------------------------------------------------------------

export const CHARACTER_IMPORT_FIELD_DISPOSITIONS = [
  'mapped',
  'partially-mapped',
  'ignored',
  'unsupported',
  'unresolved-reference',
  'invalid-source',
] as const

export type CharacterImportFieldDisposition = (typeof CHARACTER_IMPORT_FIELD_DISPOSITIONS)[number]

export const CHARACTER_IMPORT_DISPOSITION_REASONS = [
  'derived-from-class',
  'derived-value',
  'duplicate-source',
  'provider-metadata',
  'runtime-state',
  'not-in-local-contract',
  'requires-catalog-resolution',
  'resolved-from-local-content',
] as const

export type CharacterImportDispositionReason = (typeof CHARACTER_IMPORT_DISPOSITION_REASONS)[number]

export const characterImportDispositionEntrySchema = z.object({
  sourcePath: z.string(),
  sourceValue: z.string(),
  targetPath: z.string().optional(),
  disposition: z.enum(CHARACTER_IMPORT_FIELD_DISPOSITIONS),
  reason: z.enum(CHARACTER_IMPORT_DISPOSITION_REASONS),
  message: z.string(),
})

export type CharacterImportDispositionEntry = z.infer<typeof characterImportDispositionEntrySchema>

export type CharacterImportDispositionRule = {
  matches: (sourceValue: string) => boolean
  disposition: Extract<CharacterImportFieldDisposition, 'ignored' | 'unsupported'>
  reason: CharacterImportDispositionReason
  targetPath?: string
  message: string
}

export function partitionDispositionEntries(dispositions: CharacterImportDispositionEntry[]): {
  ignored: CharacterImportDispositionEntry[]
  unsupported: CharacterImportDispositionEntry[]
  unresolvedReference: CharacterImportDispositionEntry[]
} {
  return {
    ignored: dispositions.filter((entry) => entry.disposition === 'ignored'),
    unsupported: dispositions.filter((entry) => entry.disposition === 'unsupported'),
    unresolvedReference: dispositions.filter(
      (entry) => entry.disposition === 'unresolved-reference',
    ),
  }
}
