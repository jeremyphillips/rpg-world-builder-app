import { z } from 'zod'
import {
  authoredContentBodySchema,
  type AuthoredContentBody,
} from '../../primitives/authored-content'
import { contentProvenanceSchema } from '../../primitives/provenance'
import { systemRulesetIdSchema } from '../../primitives/ruleset'
import { catalogLayerSchema } from '../../vocab/catalog-layer'

// ---------------------------------------------------------------------------
// Content ownership — the reusable envelope every catalog content type extends
// (classes now; monsters, spells, species, equipment later). Patching/homebrew
// machinery depends only on these envelope fields, never on type-specific body
// fields, so it is authored once and shared across content types.
// ---------------------------------------------------------------------------

export {
  CATALOG_LAYER_ENTRIES,
  CATALOG_LAYER_KEYS,
  CATALOG_LAYER_OPTIONS,
  CATALOG_LAYER_TERM,
  catalogLayerSchema,
  type CatalogLayer,
  type CatalogLayerValue,
} from '../../vocab/catalog-layer'

/** Homebrew lifecycle — draft records are visible only to campaign managers. */
export const CONTENT_STATUSES = ['draft', 'published'] as const

export const contentStatusSchema = z.enum(CONTENT_STATUSES)

export type ContentStatus = z.infer<typeof contentStatusSchema>

/**
 * Content key — lowercase, hyphen-separated (e.g. `fighter`, `sleight-of-hand`).
 * Unique within a scope: system content is unique per `rulesetId`; homebrew is
 * unique per `(campaignId, rulesetId)` and must not collide with a system slug
 * (enforced at the service layer, not by this schema).
 *
 * Assigned from `name` on homebrew create via `deriveContentKey`; immutable
 * after first POST. See [Content key mutability](../../../../docs/content-types.md#content-key-mutability).
 */
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export type Slug = z.infer<typeof slugSchema>

/**
 * Stored ownership envelope shared by every catalog content type.
 *
 * `id` is the opaque, globally-unique REFERENCE key — deterministic for system
 * seed (`"<rulesetId>:<slug>"`), Mongo-generated for homebrew. Treat it as
 * opaque: filter on the discrete fields below, never by parsing `id`.
 * `campaignId` is set for homebrew (campaign-owned) and null for system content.
 */
export const contentMetaSchema = z.object({
  id: z.string().min(1),
  slug: slugSchema,
  rulesetId: systemRulesetIdSchema,
  catalogLayer: catalogLayerSchema,
  status: contentStatusSchema.default('published'),
  campaignId: z.string().min(1).nullable(),
  provenance: contentProvenanceSchema.optional(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type ContentMeta = z.infer<typeof contentMetaSchema>

/**
 * Generic system-patch overlay envelope, shared by every content type. A
 * campaign never mutates a shipped system record; it stores an overlay patch
 * keyed by the base record's `targetId`, deep-merged onto the base at read time.
 *
 * Type modules add the type-specific body via
 * `.extend({ patch: <body>.partial() })`, so the patch/homebrew rules never live
 * in a single content feature. A `(campaignId, targetId)` uniqueness rule (one
 * patch per record per campaign) is enforced at the Mongo/service layer.
 */
/**
 * Catalog-facing alias for the neutral authored-content primitive. Catalog
 * content types retain this name while campaign-owned world content and seed
 * contracts can consume `authoredContentBodySchema` directly without adopting
 * the catalog ownership envelope.
 */
export const contentBodyBaseSchema = authoredContentBodySchema

export type ContentBodyBase = AuthoredContentBody

export const contentPatchBaseSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1),
  targetId: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type ContentPatchBase = z.infer<typeof contentPatchBaseSchema>
