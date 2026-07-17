import { z } from 'zod'

// ---------------------------------------------------------------------------
// Provenance and licensing — required on every collection and convention.
// ---------------------------------------------------------------------------

export const NAME_COLLECTION_LICENSES = [
  'public-domain',
  'cc0',
  'cc-by',
  'original',
  'licensed',
  'unknown',
] as const

export const nameCollectionLicenseSchema = z.enum(NAME_COLLECTION_LICENSES)

export type NameCollectionLicense = z.infer<typeof nameCollectionLicenseSchema>

export const NAME_COLLECTION_METHODOLOGIES = [
  'curated',
  'historical-records',
  'pattern-derived',
  'original-fictional',
] as const

export const nameCollectionMethodologySchema = z.enum(NAME_COLLECTION_METHODOLOGIES)

export type NameCollectionMethodology = z.infer<typeof nameCollectionMethodologySchema>

export const nameCollectionProvenanceSchema = z.object({
  sourceName: z.string().min(1),
  sourceUrl: z.string().url().optional(),
  license: nameCollectionLicenseSchema,
  attribution: z.string().min(1).optional(),
  methodology: nameCollectionMethodologySchema,
  notes: z.string().min(1).optional(),
})

export type NameCollectionProvenance = z.infer<typeof nameCollectionProvenanceSchema>
