import type { z } from 'zod'

import { formatVocabularySlugLabel } from '../format-slug-label'
import { getTermSentenceForm, type GameTermEntry } from '../types'
import { vocabularyOptionIdSchema, type VocabularyOptionSetId } from '../vocabulary'
import { getPhysicalDamageTypeEntry, getPhysicalDamageTypeLabel } from './physical'

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

/** Returns a display label — physical entries first, then title-cased slug fallback. */
export function getDamageTypeLabel(id: string): string {
  const physicalLabel = getPhysicalDamageTypeLabel(id)
  if (physicalLabel !== id) return physicalLabel
  return formatVocabularySlugLabel(id)
}

/** Returns the best-known entry for a damage type id. */
export function getDamageTypeEntry(id: string): GameTermEntry {
  const physicalEntry = getPhysicalDamageTypeEntry(id)
  if (physicalEntry) return physicalEntry

  const label = formatVocabularySlugLabel(id)
  const phrase = `${label.toLowerCase()} damage`
  return {
    label,
    description: '',
    sentence: {
      singular: phrase,
      plural: phrase,
    },
  }
}

/** Counted/mass noun phrase for generated damage-type prose. */
export function getDamageTypeSentenceForm(id: string, count = 1): string {
  return getTermSentenceForm(getDamageTypeEntry(id), count)
}
