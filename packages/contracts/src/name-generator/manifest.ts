import { z } from 'zod'

import { nameCollectionIdSchema, nameGeneratorKindSchema } from './collection'
import { nameConventionIdSchema } from './naming-convention'
import { namingAssociationSchema } from './naming-association'
import { nameSubjectKindSchema } from './subject-kind'

// ---------------------------------------------------------------------------
// Manifest entries — lightweight registry metadata for browsing and lazy load.
// ---------------------------------------------------------------------------

export const nameCollectionManifestEntrySchema = z.object({
  id: nameCollectionIdSchema,
  label: z.string().min(1),
  subjectKinds: z.array(nameSubjectKindSchema).min(1),
  generatorKinds: z.array(nameGeneratorKindSchema).min(1),
  assetPath: z.string().min(1),
  approximateResultCount: z.number().int().min(0).optional(),
})

export type NameCollectionManifestEntry = z.infer<typeof nameCollectionManifestEntrySchema>

export const nameConventionManifestEntrySchema = z.object({
  id: nameConventionIdSchema,
  label: z.string().min(1),
  subjectKinds: z.array(nameSubjectKindSchema).min(1),
  associations: z.array(namingAssociationSchema),
  collectionIds: z.array(nameCollectionIdSchema).min(1),
  structureIds: z.array(z.string().min(1)).min(1),
  tags: z.array(z.string().min(1)).optional(),
})

export type NameConventionManifestEntry = z.infer<typeof nameConventionManifestEntrySchema>

export const nameCollectionManifestSchema = z.array(nameCollectionManifestEntrySchema)

export const nameConventionManifestSchema = z.array(nameConventionManifestEntrySchema)
