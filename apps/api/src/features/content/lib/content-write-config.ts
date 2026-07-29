import type { Model } from 'mongoose'
import type { ZodType } from 'zod'

import type {
  ContentAccessTargetType,
  ContentSource,
  SystemRulesetId,
  ContentStatus,
  ContentUsageBlocker,
  ContentValidationIntent,
} from '@rpg/contracts'

import type { ContentTypeConfig } from './content-type-config'
import type { ContentPatchSchemaType } from './content-patch-model'
import type { ContentTypeName } from '../content-types'

/** Minimal Mongo homebrew document shape every write mapper receives. */
export interface HomebrewDoc {
  _id: unknown
  campaignId: string
  rulesetId: string
  slug: string
  status?: string
  createdAt: Date
  updatedAt: Date
  [key: string]: unknown
}

/** Minimal entity shape every write/read registration must satisfy. */
export type WriteEntityBase = {
  id: string
  slug: string
  source: ContentSource
  status: ContentStatus
  campaignId: string | null
}

/** Context passed to per-type write hooks. */
export interface ContentWriteContext {
  campaignId: string
  rulesetId: SystemRulesetId
  mode: 'create' | 'update'
  /** Draft vs publish validation family for this write. */
  validationIntent: ContentValidationIntent
  /** Parsed create/update DTO fields. */
  input: Record<string, unknown>
  /** Normalized payload before schema parse. */
  normalized: Record<string, unknown>
  /** Set on update after catalog lookup. */
  existing?: WriteEntityBase
}

export interface ContentWriteAfterContext extends ContentWriteContext {
  entity: WriteEntityBase
}

export interface ContentDeleteContext {
  campaignId: string
  entity: WriteEntityBase
}

/**
 * Per-type wiring for create/update authoring endpoints. Pairs with the
 * read-side `ContentTypeConfig` in each `*.config.ts`.
 */
export interface ContentWriteConfig<T extends WriteEntityBase> {
  typeName: ContentTypeName
  /** Campaign access target type when it differs from `typeName` (e.g. subclasses). */
  campaignAccessTargetType?: ContentAccessTargetType
  readConfig: ContentTypeConfig<T>
  /** JSON response key (e.g. `'armor'`, `'skillProficiencies'`). */
  responseKey: string
  createInputSchema: ZodType
  updateInputSchema: ZodType
  /** Draft create input — falls back to `createInputSchema` when omitted. */
  createDraftInputSchema?: ZodType
  /** Draft update input — falls back to `updateInputSchema` when omitted. */
  updateDraftInputSchema?: ZodType
  /** Full stored record schema — validates homebrew entities after write. */
  storedSchema: ZodType<T>
  /** Draft stored record — falls back to `storedSchema` when omitted. */
  draftStoredSchema?: ZodType
  /** Body-only schema — validates merged system patches before upsert. */
  bodySchema: ZodType
  homebrewModel: Model<unknown>
  patchModel?: Model<ContentPatchSchemaType>
  toHomebrewEntity: (doc: HomebrewDoc) => T
  /** Maps validated create input to Mongo document fields (excludes envelope). */
  bodyFromCreateInput: (input: Record<string, unknown>) => Record<string, unknown>
  /**
   * Optional hook to shape a homebrew `$set` payload. Default passes update through.
   */
  prepareHomebrewUpdate?: (
    doc: HomebrewDoc,
    update: Record<string, unknown>,
  ) => Record<string, unknown>
  /** Runs after input is parsed, before slug checks and persistence. */
  validateBeforeWrite?: (ctx: ContentWriteContext) => Promise<void>
  /** Runs after a successful write; may return a parsed/enriched entity for the API response. */
  afterWrite?: (ctx: ContentWriteAfterContext) => Promise<T>
  /** Adds blockers beyond shared character usage resolution (future cross-refs, rule-only blockers). */
  resolveDeleteBlockers?: (ctx: ContentDeleteContext) => Promise<ContentUsageBlocker[]>
  /** Adds blockers beyond shared character usage resolution for demote guards. */
  resolveDemoteBlockers?: (ctx: ContentDeleteContext) => Promise<ContentUsageBlocker[]>
  /** Whether character references block demotion. Defaults to true. */
  characterUsageBlocksDemotion?: boolean
  /** When set, replaces default character usage resolution for delete guards. */
  resolveCharacterUsageBlockers?: (ctx: ContentDeleteContext) => Promise<ContentUsageBlocker[]>
}

/** Selects the create/update input schema for a validation intent. */
export function resolveWriteInputSchema<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  mode: 'create' | 'update',
  validationIntent: ContentValidationIntent,
): ZodType {
  if (validationIntent === 'draft') {
    if (mode === 'create') {
      return config.createDraftInputSchema ?? config.createInputSchema
    }
    return config.updateDraftInputSchema ?? config.updateInputSchema
  }

  return mode === 'create' ? config.createInputSchema : config.updateInputSchema
}

/** Selects the stored record schema for a validation intent. */
export function resolveStoredSchema<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  validationIntent: ContentValidationIntent,
): ZodType<T> {
  if (validationIntent === 'draft' && config.draftStoredSchema) {
    return config.draftStoredSchema as ZodType<T>
  }
  return config.storedSchema
}
