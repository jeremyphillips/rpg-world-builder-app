import { z } from 'zod'

import { duplicateIds, overlayIdSchema } from './ids'

/**
 * Author intent for one object. This schema has no defaults: a missing key was
 * not edited. It is not a parsed content body.
 */
export type ObjectDelta = {
  set?: Record<string, unknown>
  clear?: string[]
  restore?: string[]
  collections?: Record<string, CollectionDelta>
}

export type SeedFieldDelta = {
  origin: 'seed'
  id: string
  set?: Record<string, unknown>
  clear?: string[]
  restore?: string[]
  collections?: Record<string, CollectionDelta>
}

export type SeedRowReplace = {
  origin: 'seed'
  id: string
  mode: 'replace'
  row: Record<string, unknown>
}

export type CollectionDelta = {
  reset?: true
  overrides?: Array<SeedFieldDelta | SeedRowReplace>
  additions?: Array<{ id: string; row: Record<string, unknown> }>
  removedIds?: string[]
  restoreIds?: string[]
  order?: string[]
  restoreOrder?: true
}

const objectDeltaSchema: z.ZodType<ObjectDelta> = z.lazy(() =>
  z
    .object({
      set: z.record(z.string(), z.unknown()).optional(),
      clear: z.array(z.string().min(1)).optional(),
      restore: z.array(z.string().min(1)).optional(),
      collections: z.record(z.string(), collectionDeltaSchema).optional(),
    })
    .strict(),
)

const seedFieldDeltaSchema: z.ZodType<SeedFieldDelta> = z.lazy(() =>
  z
    .object({
      origin: z.literal('seed'),
      id: overlayIdSchema,
      set: z.record(z.string(), z.unknown()).optional(),
      clear: z.array(z.string().min(1)).optional(),
      restore: z.array(z.string().min(1)).optional(),
      collections: z.record(z.string(), collectionDeltaSchema).optional(),
    })
    .strict()
    .superRefine((value, ctx) => {
      const hasSignal =
        value.set !== undefined ||
        (value.clear?.length ?? 0) > 0 ||
        (value.restore?.length ?? 0) > 0 ||
        value.collections !== undefined
      if (!hasSignal) {
        ctx.addIssue({ code: 'custom', message: 'Seed row intent is empty' })
      }
    }),
)

const seedRowReplaceSchema = z
  .object({
    origin: z.literal('seed'),
    id: overlayIdSchema,
    mode: z.literal('replace'),
    row: z.record(z.string(), z.unknown()),
  })
  .strict()

const homebrewAdditionSchema = z
  .object({
    id: overlayIdSchema,
    row: z.record(z.string(), z.unknown()),
  })
  .strict()

type CollectionIntentFields = {
  reset?: true
  restoreOrder?: true
  overrides?: Array<{ id: string }>
  additions?: Array<{ id: string }>
  removedIds?: string[]
  restoreIds?: string[]
  order?: string[]
}

function collectionIntentIds(value: CollectionIntentFields): string[] {
  return [
    ...(value.overrides?.map((row) => row.id) ?? []),
    ...(value.additions?.map((row) => row.id) ?? []),
  ]
}

function collectionIntentHasSignal(value: CollectionIntentFields): boolean {
  if (value.reset === true || value.restoreOrder === true) return true
  const populated = [
    value.overrides,
    value.additions,
    value.removedIds,
    value.restoreIds,
    value.order,
  ]
  return populated.some((entries) => (entries?.length ?? 0) > 0)
}

function refineCollectionIntent(value: CollectionIntentFields, ctx: z.RefinementCtx): void {
  if (!collectionIntentHasSignal(value)) {
    ctx.addIssue({ code: 'custom', message: 'Collection intent is empty' })
  }
  for (const id of duplicateIds(collectionIntentIds(value))) {
    ctx.addIssue({ code: 'custom', message: `Duplicate overlay id ${id}` })
  }
}

const collectionDeltaSchema: z.ZodType<CollectionDelta> = z.lazy(() =>
  z
    .object({
      reset: z.literal(true).optional(),
      overrides: z.array(z.union([seedRowReplaceSchema, seedFieldDeltaSchema])).optional(),
      additions: z.array(homebrewAdditionSchema).optional(),
      removedIds: z.array(overlayIdSchema).optional(),
      restoreIds: z.array(overlayIdSchema).optional(),
      order: z.array(overlayIdSchema).optional(),
      restoreOrder: z.literal(true).optional(),
    })
    .strict()
    .superRefine(refineCollectionIntent),
)

export const systemOverlayIntentSchema = objectDeltaSchema

export function parseSystemOverlayIntent(input: unknown): ObjectDelta {
  return systemOverlayIntentSchema.parse(input)
}
