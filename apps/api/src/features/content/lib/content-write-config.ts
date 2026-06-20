import type { Model } from 'mongoose'
import type { ZodType } from 'zod'

import type { ContentSource } from '@rpg/contracts'

import type { ContentTypeConfig } from './content-type-config'
import type { ContentPatchSchemaType } from './content-patch-model'
import type { ContentTypeName } from '../content-types'

/** Minimal Mongo homebrew document shape every write mapper receives. */
export interface HomebrewDoc {
  _id: unknown
  campaignId: string
  rulesetId: string
  slug: string
  createdAt: Date
  updatedAt: Date
  [key: string]: unknown
}

/**
 * Per-type wiring for create/update authoring endpoints. Pairs with the
 * read-side `ContentTypeConfig` in each `*.config.ts`.
 */
export interface ContentWriteConfig<
  T extends { id: string; slug: string; source: ContentSource; campaignId: string | null },
> {
  typeName: ContentTypeName
  readConfig: ContentTypeConfig<T>
  /** JSON response key (e.g. `'armor'`, `'skillProficiencies'`). */
  responseKey: string
  createInputSchema: ZodType
  updateInputSchema: ZodType
  /** Full stored record schema — validates homebrew entities after write. */
  storedSchema: ZodType<T>
  /** Body-only schema — validates merged system patches before upsert. */
  bodySchema: ZodType
  homebrewModel: Model<unknown>
  patchModel?: Model<ContentPatchSchemaType>
  toHomebrewEntity: (doc: HomebrewDoc) => T
  /** Maps validated create input to Mongo document fields (excludes envelope). */
  bodyFromCreateInput: (input: Record<string, unknown>) => Record<string, unknown>
  /**
   * Optional hook to shape a homebrew `$set` payload. Equipment stores
   * kind-specific fields in a nested `body` blob; default passes update through.
   */
  prepareHomebrewUpdate?: (
    doc: HomebrewDoc,
    update: Record<string, unknown>,
  ) => Record<string, unknown>
}
