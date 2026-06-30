import { z } from 'zod'
import { systemRulesetIdSchema } from '../../primitives/ruleset'

// ---------------------------------------------------------------------------
// Content ownership — the reusable envelope every catalog content type extends
// (classes now; monsters, spells, species, equipment later). Patching/homebrew
// machinery depends only on these envelope fields, never on type-specific body
// fields, so it is authored once and shared across content types.
// ---------------------------------------------------------------------------

/**
 * Where a content record comes from.
 * - system   → shipped SRD catalog (read-only; `campaignId` is null)
 * - homebrew → authored within a campaign (`campaignId` is set)
 */
export const CONTENT_SOURCES = ['system', 'homebrew'] as const

export const contentSourceSchema = z.enum(CONTENT_SOURCES)

export type ContentSource = z.infer<typeof contentSourceSchema>

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
  source: contentSourceSchema,
  campaignId: z.string().min(1).nullable(),
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
 * Shared editable base for every content type body. Each content type's body
 * schema extends this so that fields like `imageKey` are uniformly available
 * across classes, spells, monsters, etc. without being part of the ownership
 * envelope (`contentMetaSchema`).
 *
 * Add new cross-type body fields here — they propagate automatically to every
 * content type's patch schema via `<typeBodySchema>.partial()`.
 */
export const contentBodyBaseSchema = z.object({
  /** Storage key for the content item's artwork. Resolve to a URL with `getAssetUrl`. */
  imageKey: z.string().optional(),
  name: z.string().min(1),
  /** Rich-text HTML (TipTap / SRD prose). Render with `RichTextContent`. */
  description: z.string().optional(),
})

export type ContentBodyBase = z.infer<typeof contentBodyBaseSchema>

export const contentPatchBaseSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1),
  targetId: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

export type ContentPatchBase = z.infer<typeof contentPatchBaseSchema>
