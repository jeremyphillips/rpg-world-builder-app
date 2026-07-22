import { z } from 'zod'

/**
 * Shared editable fields for named, authored RPG content.
 *
 * Ownership and persistence metadata intentionally live outside this shape so
 * rules catalog records, campaign-owned world content, and shipped seed
 * entries can compose the same authoring fields with their own envelopes.
 */
export const authoredContentBodySchema = z.object({
  /** Storage key for the content item's artwork. Resolve to a URL with `getAssetUrl`. */
  imageKey: z.string().optional(),
  name: z.string().min(1),
  /** Rich-text HTML (TipTap / authored prose). Render with `RichTextContent`. */
  description: z.string().optional(),
})

export type AuthoredContentBody = z.infer<typeof authoredContentBodySchema>
