import { z } from 'zod'

import { nameCollectionIdSchema } from './collection'
import { nameCollectionProvenanceSchema } from './provenance'
import { nameStructureDefinitionSchema } from './name-structure'
import { namingAssociationSchema } from './naming-association'
import { nameSubjectKindSchema } from './subject-kind'

// ---------------------------------------------------------------------------
// Naming conventions — how names are constructed and where they apply.
// ---------------------------------------------------------------------------

export const nameConventionIdSchema = z.string().regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/)

export type NameConventionId = z.infer<typeof nameConventionIdSchema>

export const namingConventionPartBindingSchema = z.object({
  partKey: z.string().min(1),
  collectionId: nameCollectionIdSchema,
  sourceKey: z.string().min(1).optional(),
})

export type NamingConventionPartBinding = z.infer<typeof namingConventionPartBindingSchema>

export const namingConventionSchema = z
  .object({
    id: nameConventionIdSchema,
    label: z.string().min(1),
    description: z.string().min(1).optional(),
    subjectKinds: z.array(nameSubjectKindSchema).min(1),
    associations: z.array(namingAssociationSchema),
    structures: z.array(nameStructureDefinitionSchema).min(1),
    partBindings: z.array(namingConventionPartBindingSchema).min(1),
    collectionIds: z.array(nameCollectionIdSchema).min(1),
    provenance: nameCollectionProvenanceSchema,
    tags: z.array(z.string().min(1)).optional(),
    version: z.number().int().positive(),
  })
  .superRefine((convention, ctx) => {
    const structurePartKeys = new Set(
      convention.structures.flatMap((structure) => structure.parts.map((part) => part.key)),
    )
    const collectionIdSet = new Set(convention.collectionIds)

    for (const [index, binding] of convention.partBindings.entries()) {
      if (!structurePartKeys.has(binding.partKey)) {
        ctx.addIssue({
          code: 'custom',
          message: `Part binding "${binding.partKey}" does not match any structure part key`,
          path: ['partBindings', index, 'partKey'],
        })
      }

      if (!collectionIdSet.has(binding.collectionId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Part binding collection "${binding.collectionId}" is not listed in collectionIds`,
          path: ['partBindings', index, 'collectionId'],
        })
      }
    }

    for (const [index, collectionId] of convention.collectionIds.entries()) {
      const referenced = convention.partBindings.some(
        (binding) => binding.collectionId === collectionId,
      )
      if (!referenced) {
        ctx.addIssue({
          code: 'custom',
          message: `Collection "${collectionId}" is not referenced by any part binding`,
          path: ['collectionIds', index],
        })
      }
    }
  })

export type NamingConvention = z.infer<typeof namingConventionSchema>
