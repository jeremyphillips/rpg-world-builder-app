import type { z } from 'zod'

import { formatVocabularySlugLabel } from '../format-slug-label'
import { vocabularyOptionIdSchema, type VocabularyOptionSetId } from '../vocabulary'
import { getPhysicalDamageTypeLabel } from './physical'

// ---------------------------------------------------------------------------
// Damage types (elemental + planar) — open vocabulary set. Physical types stay
// closed in `./physical.ts`. Catalog seed + campaign patch govern membership.
// ---------------------------------------------------------------------------

export const DAMAGE_TYPE_SET_ID = 'damage-types' as const satisfies VocabularyOptionSetId

/**
 * Primitive shape for stored damage type ids (grants, spell tags, resistances).
 * Catalog membership is validated against the campaign-resolved vocabulary.
 */
export const damageTypeIdSchema = vocabularyOptionIdSchema

export type DamageTypeId = z.infer<typeof damageTypeIdSchema>

/** @deprecated Use `damageTypeIdSchema`. */
export const damageTypeSchema = damageTypeIdSchema

/** @deprecated Use `DamageTypeId`. */
export type DamageType = DamageTypeId

/** Returns a display label — physical entries first, then title-cased slug fallback. */
export function getDamageTypeLabel(id: string): string {
  const physicalLabel = getPhysicalDamageTypeLabel(id)
  if (physicalLabel !== id) return physicalLabel
  return formatVocabularySlugLabel(id)
}
