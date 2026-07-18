import { z } from 'zod'

import { nameGenderStyleSchema } from './generation'
import { type NamePartRole } from './name-structure'
import { nameCollectionProvenanceSchema } from './provenance'
import { nameSubjectKindSchema } from './subject-kind'

// ---------------------------------------------------------------------------
// Name collections — independently loadable data assets with generation strategies.
// ---------------------------------------------------------------------------

export const nameCollectionIdSchema = z.string().regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/)

export type NameCollectionId = z.infer<typeof nameCollectionIdSchema>

export const NAME_GENERATOR_KINDS = ['sample', 'syllable', 'compound'] as const

export const nameGeneratorKindSchema = z.enum(NAME_GENERATOR_KINDS)

export type NameGeneratorKind = z.infer<typeof nameGeneratorKindSchema>

export type NamePoolRole = NamePartRole | 'complete'

export const NAME_POOL_ROLES = [
  'given',
  'family',
  'clan',
  'house',
  'virtue',
  'epithet',
  'title',
  'descriptor',
  'placeRoot',
  'placeSuffix',
  'organizationType',
  'complete',
] as const

export const namePoolRoleSchema = z.enum(NAME_POOL_ROLES)

export const namePoolSchema = z.object({
  id: z.string().min(1),
  role: namePoolRoleSchema,
  genderStyle: nameGenderStyleSchema.optional(),
  values: z.array(z.string().min(1)).min(1),
})

export type NamePool = z.infer<typeof namePoolSchema>

export const sampleNameGeneratorSchema = z.object({
  type: z.literal('sample'),
  pools: z.array(namePoolSchema).min(1),
})

export type SampleNameGenerator = z.infer<typeof sampleNameGeneratorSchema>

export const syllableNameGeneratorSchema = z.object({
  type: z.literal('syllable'),
  patterns: z.array(z.string().min(1)).min(1),
  pools: z.object({
    onset: z.array(z.string().min(1)).optional(),
    nucleus: z.array(z.string().min(1)).optional(),
    coda: z.array(z.string().min(1)).optional(),
    prefix: z.array(z.string().min(1)).optional(),
    suffix: z.array(z.string().min(1)).optional(),
  }),
  constraints: z
    .object({
      minSyllables: z.number().int().min(1).optional(),
      maxSyllables: z.number().int().min(1).optional(),
      disallowedSequences: z.array(z.string().min(1)).optional(),
      capitalize: z.boolean().optional(),
    })
    .optional(),
})

export type SyllableNameGenerator = z.infer<typeof syllableNameGeneratorSchema>

export const compoundNameGeneratorSchema = z.object({
  type: z.literal('compound'),
  parts: z
    .array(
      z.object({
        pool: z.string().min(1),
        optional: z.boolean().optional(),
        separator: z.string().optional(),
      }),
    )
    .min(1),
  pools: z.record(z.string(), z.array(z.string().min(1)).min(1)),
})

export type CompoundNameGenerator = z.infer<typeof compoundNameGeneratorSchema>

export const nameGeneratorDefinitionSchema = z.discriminatedUnion('type', [
  sampleNameGeneratorSchema,
  syllableNameGeneratorSchema,
  compoundNameGeneratorSchema,
])

export type NameGeneratorDefinition = z.infer<typeof nameGeneratorDefinitionSchema>

export const nameCollectionSchema = z.object({
  id: nameCollectionIdSchema,
  label: z.string().min(1),
  description: z.string().min(1).optional(),
  subjectKinds: z.array(nameSubjectKindSchema).min(1),
  generator: nameGeneratorDefinitionSchema,
  provenance: nameCollectionProvenanceSchema,
  version: z.number().int().positive(),
})

export type NameCollection = z.infer<typeof nameCollectionSchema>

export function getNameGeneratorKinds(generator: NameGeneratorDefinition): NameGeneratorKind[] {
  return [generator.type]
}
