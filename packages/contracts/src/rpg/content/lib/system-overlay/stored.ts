import { z } from 'zod'

import { duplicateIds, overlayIdSchema } from './ids'
import type { SeedRowReplace } from './intent'

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

export type StoredSeedOverride = {
  origin: 'seed'
  id: string
  set?: Record<string, unknown>
  clear?: string[]
  restore?: string[]
  collections?: Record<string, StoredCollection>
}

export type LegacyHold = {
  origin: 'seed'
  id: string
  retention: 'legacy'
  row: unknown
}

export type HomebrewAddition = {
  origin: 'homebrew'
  id: string
  row: Record<string, unknown>
}

export type StoredIdentityCollection = {
  kind: 'identity'
  overrides: Array<StoredSeedOverride | SeedRowReplace | LegacyHold>
  additions: HomebrewAddition[]
  removedIds: string[]
  order?: string[]
}

export type StoredCollection =
  | { kind: 'legacy-array'; rows: unknown[] }
  | { kind: 'value-list'; items: unknown[] }
  | StoredIdentityCollection

export type StoredOverlay = {
  version: 1
  revision: number
  set?: Record<string, unknown>
  clear?: string[]
  restore?: string[]
  collections?: Record<string, StoredCollection>
}

const seedFieldDeltaSchema: z.ZodType<StoredSeedOverride> = z.lazy(() =>
  z
    .object({
      origin: z.literal('seed'),
      id: overlayIdSchema,
      set: z.record(z.string(), z.unknown()).optional(),
      clear: z.array(z.string().min(1)).optional(),
      restore: z.array(z.string().min(1)).optional(),
      collections: z.record(z.string(), storedCollectionSchema).optional(),
    })
    .strict()
    .superRefine((value, ctx) => {
      const hasSignal =
        value.set !== undefined ||
        (value.clear?.length ?? 0) > 0 ||
        (value.restore?.length ?? 0) > 0 ||
        value.collections !== undefined
      if (!hasSignal) {
        ctx.addIssue({ code: 'custom', message: 'Seed row override is empty' })
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

const legacyHoldSchema = z
  .object({
    origin: z.literal('seed'),
    id: overlayIdSchema,
    retention: z.literal('legacy'),
    row: z.unknown(),
  })
  .strict()

const homebrewAdditionSchema = z
  .object({
    origin: z.literal('homebrew'),
    id: overlayIdSchema,
    row: z.record(z.string(), z.unknown()),
  })
  .strict()

const storedCollectionSchema: z.ZodType<StoredCollection> = z.lazy(() =>
  z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('legacy-array'), rows: z.array(z.unknown()) }).strict(),
    z.object({ kind: z.literal('value-list'), items: z.array(z.unknown()) }).strict(),
    z
      .object({
        kind: z.literal('identity'),
        overrides: z.array(z.union([legacyHoldSchema, seedRowReplaceSchema, seedFieldDeltaSchema])),
        additions: z.array(homebrewAdditionSchema),
        removedIds: z.array(overlayIdSchema),
        order: z.array(overlayIdSchema).optional(),
      })
      .strict()
      .superRefine((value, ctx) => {
        const ids = [
          ...value.overrides.map((row) => row.id),
          ...value.additions.map((row) => row.id),
          ...value.removedIds,
        ]
        for (const id of duplicateIds(ids)) {
          ctx.addIssue({ code: 'custom', message: `Duplicate overlay id ${id}` })
        }
      }),
  ]),
)

function rejectUnsafeKeys(value: Record<string, unknown>, ctx: z.RefinementCtx): void {
  for (const key of Object.keys(value)) {
    if (UNSAFE_KEYS.has(key)) {
      ctx.addIssue({ code: 'custom', message: `Unsafe overlay key ${key}` })
    }
  }
}

export const storedOverlaySchema = z
  .object({
    version: z.literal(1),
    revision: z.number().int().nonnegative(),
    set: z.record(z.string(), z.unknown()).optional(),
    clear: z.array(z.string().min(1)).optional(),
    restore: z.array(z.string().min(1)).optional(),
    collections: z.record(z.string(), storedCollectionSchema).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.set) rejectUnsafeKeys(value.set, ctx)
    if (value.collections) rejectUnsafeKeys(value.collections, ctx)
  })

export function parseStoredOverlay(input: unknown): StoredOverlay {
  return storedOverlaySchema.parse(input)
}
